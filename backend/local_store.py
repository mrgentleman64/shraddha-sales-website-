import copy
import json
import re
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional


class LocalCursor:
    def __init__(self, docs: Iterable[Dict[str, Any]]):
        self.docs = [copy.deepcopy(doc) for doc in docs]

    def sort(self, key: str, direction: int = 1):
        self.docs.sort(key=lambda item: item.get(key, ''), reverse=direction < 0)
        return self

    def limit(self, count: int):
        self.docs = self.docs[:count]
        return self

    async def to_list(self, count: Optional[int] = None):
        return self.docs if count is None else self.docs[:count]


class LocalCollection:
    def __init__(self, database: "LocalDatabase", name: str):
        self.database = database
        self.name = name

    @property
    def docs(self) -> List[Dict[str, Any]]:
        return self.database.data.setdefault(self.name, [])

    async def create_index(self, *_args, **_kwargs):
        return None

    async def find_one(self, query: Optional[Dict[str, Any]] = None, projection: Optional[Dict[str, int]] = None):
        for doc in self.docs:
            if _matches(doc, query or {}):
                return _project(doc, projection)
        return None

    def find(self, query: Optional[Dict[str, Any]] = None, projection: Optional[Dict[str, int]] = None):
        return LocalCursor(_project(doc, projection) for doc in self.docs if _matches(doc, query or {}))

    async def insert_one(self, doc: Dict[str, Any]):
        self.docs.append(copy.deepcopy(doc))
        self.database.save()
        return {"inserted_id": doc.get("id")}

    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any]):
        for doc in self.docs:
            if _matches(doc, query):
                if "$set" in update:
                    doc.update(copy.deepcopy(update["$set"]))
                if "$inc" in update:
                    for key, value in update["$inc"].items():
                        doc[key] = doc.get(key, 0) + value
                self.database.save()
                return {"modified_count": 1}
        return {"modified_count": 0}

    async def delete_one(self, query: Dict[str, Any]):
        for index, doc in enumerate(self.docs):
            if _matches(doc, query):
                self.docs.pop(index)
                self.database.save()
                return {"deleted_count": 1}
        return {"deleted_count": 0}

    async def delete_many(self, query: Dict[str, Any]):
        original = len(self.docs)
        self.database.data[self.name] = [doc for doc in self.docs if not _matches(doc, query)]
        deleted = original - len(self.database.data[self.name])
        if deleted:
            self.database.save()
        return {"deleted_count": deleted}

    async def count_documents(self, query: Dict[str, Any]):
        return sum(1 for doc in self.docs if _matches(doc, query))

    def aggregate(self, pipeline: List[Dict[str, Any]]):
        docs = [copy.deepcopy(doc) for doc in self.docs]
        for stage in pipeline:
            if "$match" in stage:
                docs = [doc for doc in docs if _matches(doc, stage["$match"])]
            if "$group" in stage:
                group = stage["$group"]
                result: Dict[str, Any] = {"_id": group.get("_id")}
                for key, expr in group.items():
                    if key == "_id":
                        continue
                    if expr == {"$sum": 1}:
                        result[key] = len(docs)
                    elif isinstance(expr, dict) and "$sum" in expr:
                        field = str(expr["$sum"]).lstrip("$")
                        result[key] = sum(float(doc.get(field, 0) or 0) for doc in docs)
                docs = [result] if docs or result else []
        return LocalCursor(docs)


class LocalDatabase:
    def __init__(self, path: Path):
        self.path = path
        if path.exists():
            self.data = json.loads(path.read_text(encoding="utf-8"))
        else:
            self.data = {}

    def __getattr__(self, name: str):
        return LocalCollection(self, name)

    def save(self):
        self.path.write_text(json.dumps(self.data, indent=2), encoding="utf-8")


def _project(doc: Dict[str, Any], projection: Optional[Dict[str, int]]):
    copied = copy.deepcopy(doc)
    if projection and projection.get("_id") == 0:
        copied.pop("_id", None)
    return copied


def _matches(doc: Dict[str, Any], query: Dict[str, Any]):
    for key, expected in query.items():
        if key == "$or":
            if not any(_matches(doc, option) for option in expected):
                return False
            continue

        actual = doc.get(key)
        if isinstance(expected, dict) and "$regex" in expected:
            flags = re.I if "i" in expected.get("$options", "") else 0
            if isinstance(actual, list):
                if not any(re.search(expected["$regex"], str(item), flags) for item in actual):
                    return False
            elif not re.search(expected["$regex"], str(actual or ""), flags):
                return False
            continue

        if isinstance(expected, dict):
            if "$gte" in expected and not (actual is not None and actual >= expected["$gte"]):
                return False
            if "$lte" in expected and not (actual is not None and actual <= expected["$lte"]):
                return False
            if "$lt" in expected and not (actual is not None and actual < expected["$lt"]):
                return False
            continue

        if isinstance(actual, list):
            if expected not in actual:
                return False
        elif actual != expected:
            return False
    return True
