from dotenv import load_dotenv
from pathlib import Path
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, Query, UploadFile, File
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Any, Dict
from datetime import datetime, timezone, timedelta
import os
import uuid
import logging
import bcrypt
import jwt
import re
import importlib.util
from local_store import LocalDatabase

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('shradhasales')

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=1200)
db = client[os.environ.get('DB_NAME', 'test_database')]
DB_BACKEND = 'mongo'

app = FastAPI(title='shradhasales API')
api = APIRouter(prefix='/api')

JWT_ALGO = 'HS256'
UPLOAD_DIR = ROOT_DIR / 'uploads'
UPLOAD_MAX_BYTES = int(os.environ.get('UPLOAD_MAX_BYTES', str(12 * 1024 * 1024)))
ALLOWED_UPLOAD_TYPES = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
}
HAS_MULTIPART = importlib.util.find_spec('multipart') is not None


def get_cors_origins() -> List[str]:
    raw_origins = os.environ.get('CORS_ORIGINS', '').strip()
    if not raw_origins or raw_origins == '*':
        return []
    return [origin.strip() for origin in raw_origins.split(',') if origin.strip()]


CORS_ORIGINS = get_cors_origins()
CORS_ORIGIN_REGEX = os.environ.get('CORS_ORIGIN_REGEX', r'https://[a-z0-9-]+\.vercel\.app|http://localhost:\d+')


def jwt_secret() -> str:
    secret = os.environ.get('JWT_SECRET')
    if not secret:
        raise RuntimeError('JWT_SECRET must be set in environment')
    return secret


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_id() -> str:
    return str(uuid.uuid4())


def slugify(value: str) -> str:
    slug = re.sub(r'[^a-z0-9]+', '-', value.lower()).strip('-')
    return slug or uuid.uuid4().hex[:8]


def normalize_badges(doc: Dict[str, Any]) -> Dict[str, Any]:
    badges = [badge for badge in doc.get('badges', []) if badge]
    ordered = []
    for badge in badges:
        if badge not in ordered:
            ordered.append(badge)

    flag_map = {
        'featured': 'featured',
        'bestseller': 'bestseller',
        'new_arrival': 'new',
        'offer': 'offer',
    }
    for flag, badge in flag_map.items():
        if doc.get(flag):
            if badge not in ordered:
                ordered.append(badge)
        elif flag in doc and badge in ordered:
            ordered.remove(badge)

    doc['badges'] = ordered
    doc['featured'] = 'featured' in ordered
    doc['bestseller'] = 'bestseller' in ordered
    doc['new_arrival'] = 'new' in ordered
    doc['offer'] = 'offer' in ordered
    if not doc.get('sku') and doc.get('model_number'):
        doc['sku'] = doc['model_number']
    return doc


def update_touched(result: Any) -> bool:
    if isinstance(result, dict):
        return bool(result.get('modified_count') or result.get('matched_count'))
    return bool(getattr(result, 'modified_count', 0) or getattr(result, 'matched_count', 0))


def hash_pw(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_pw(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


def create_token(user_id: str, email: str, role: str, days: int = 7) -> str:
    payload = {
        'sub': user_id,
        'email': email,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(days=days),
        'type': 'access',
    }
    return jwt.encode(payload, jwt_secret(), algorithm=JWT_ALGO)


def strip_doc(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if not doc:
        return None
    doc.pop('_id', None)
    doc.pop('password_hash', None)
    return doc


DEFAULT_SITE_CONTENT: Dict[str, Any] = {
    'id': 'site-content',
    'branding': {
        'site_name': 'shradhasales',
        'tagline': 'Cooling · Kitchen · Bakery',
        'company_logo': '',
        'website_logo': '',
        'footer_logo': '',
        'favicon': '',
    },
    'hero_banners': [
        {
            'title': 'Build a modern appliance storefront with trust, speed, and clarity.',
            'subtitle': 'Discover refrigerators, ACs, coolers, deep freezers and bakery equipment from top brands with premium UX designed for Indian businesses.',
            'eyebrow': 'Premium cooling solutions',
            'image': '',
            'cta_label': 'Shop products',
            'cta_link': '/products',
            'secondary_label': 'Browse categories',
            'secondary_link': '/categories',
            'active': True,
            'sort_order': 0,
        }
    ],
    'homepage_banners': [],
    'promotional_images': [],
    'carousel_images': [],
    'festival_offers': [],
    'sale_banners': [],
    'advertisement_banners': [],
    'homepage_sections': [
        {'key': 'featured_categories', 'title': 'Featured categories', 'subtitle': 'Shop by category', 'active': True, 'sort_order': 0},
        {'key': 'featured_products', 'title': 'Top picks right now', 'subtitle': 'Featured products', 'active': True, 'sort_order': 1},
    ],
    'testimonials': [],
    'customer_reviews': [],
    'contact': {
        'phone': '+91 98765 43210',
        'email': 'support@shradhasales.com',
        'address': '122 Commerce Avenue, Mumbai, India',
        'locations': 'Mumbai · Delhi · Pune',
        'working_hours': 'Mon - Sat, 9:00 AM - 7:00 PM',
    },
    'social_links': {
        'instagram': '',
        'facebook': '',
        'linkedin': '',
        'youtube': '',
        'whatsapp': '',
    },
    'footer': {
        'description': 'Premium appliances for home and commercial cooling, kitchen and bakery solutions.',
        'copyright': 'shradhasales. All rights reserved.',
        'shop_links_title': 'Shop',
        'customer_links_title': 'Customer',
    },
    'coupons': [],
    'seo': {
        'title': 'shradhasales',
        'description': 'Premium appliances for home and commercial cooling, kitchen and bakery solutions.',
        'keywords': 'appliances, refrigerators, air conditioners, coolers, bakery equipment',
    },
    'theme': {
        'primary_color': '#1e3a8a',
        'accent_color': '#f59e0b',
        'body_font': 'Manrope',
        'heading_font': 'Outfit',
    },
    'website_settings': {
        'announcement': 'COD available · GST invoice',
        'cod_enabled': True,
        'gst_invoice_enabled': True,
    },
}


def merge_site_content(doc: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    merged = {**DEFAULT_SITE_CONTENT}
    for key, default_value in DEFAULT_SITE_CONTENT.items():
        if isinstance(default_value, dict):
            merged[key] = {**default_value, **((doc or {}).get(key) or {})}
        else:
            merged[key] = (doc or {}).get(key, default_value)
    if doc:
        for key, value in doc.items():
            if key not in merged:
                merged[key] = value
    merged.pop('_id', None)
    return merged


async def get_user_from_token(request: Request) -> Optional[Dict[str, Any]]:
    token = request.headers.get('Authorization', '')
    if token.startswith('Bearer '):
        token = token[7:]
    if not token:
        return None
    try:
        payload = jwt.decode(token, jwt_secret(), algorithms=[JWT_ALGO])
    except jwt.PyJWTError:
        return None
    user = await db.users.find_one({'id': payload.get('sub')})
    return strip_doc(user) if user else None


async def require_user(request: Request) -> Dict[str, Any]:
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail='Not authenticated')
    return user


async def require_admin(request: Request) -> Dict[str, Any]:
    user = await require_user(request)
    if user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail='Admin only')
    return user


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class CategoryIn(BaseModel):
    name: str
    slug: Optional[str] = None
    image: Optional[str] = None
    description: Optional[str] = None
    visible: bool = True
    order: int = 0


class SubcategoryIn(BaseModel):
    name: str
    category_id: str
    slug: Optional[str] = None
    image: Optional[str] = None
    description: Optional[str] = None
    visible: bool = True
    order: int = 0


class BrandIn(BaseModel):
    name: str
    slug: Optional[str] = None
    logo: Optional[str] = None
    visible: bool = True
    description: Optional[str] = None


class ProductIn(BaseModel):
    name: str
    brand_id: str
    category_id: str
    subcategory_id: Optional[str] = ''
    sku: Optional[str] = ''
    model_number: Optional[str] = ''
    description: Optional[str] = ''
    highlights: List[str] = Field(default_factory=list)
    images: List[str] = Field(default_factory=list)
    videos: List[str] = Field(default_factory=list)
    price: float
    mrp: float
    discount_percent: float = 0
    gst_percent: float = 18
    stock: int = 0
    warranty: Optional[str] = '1 Year Manufacturer Warranty'
    delivery_info: Optional[str] = 'Delivered in 5-7 business days'
    specifications: Dict[str, str] = Field(default_factory=dict)
    rating: float = 4.2
    badges: List[str] = Field(default_factory=list)
    featured: bool = False
    bestseller: bool = False
    new_arrival: bool = False
    offer: bool = False
    visible: bool = True


class SiteContentIn(BaseModel):
    branding: Dict[str, Any] = Field(default_factory=dict)
    hero_banners: List[Dict[str, Any]] = Field(default_factory=list)
    homepage_banners: List[Dict[str, Any]] = Field(default_factory=list)
    promotional_images: List[Dict[str, Any]] = Field(default_factory=list)
    carousel_images: List[Dict[str, Any]] = Field(default_factory=list)
    festival_offers: List[Dict[str, Any]] = Field(default_factory=list)
    sale_banners: List[Dict[str, Any]] = Field(default_factory=list)
    advertisement_banners: List[Dict[str, Any]] = Field(default_factory=list)
    homepage_sections: List[Dict[str, Any]] = Field(default_factory=list)
    testimonials: List[Dict[str, Any]] = Field(default_factory=list)
    customer_reviews: List[Dict[str, Any]] = Field(default_factory=list)
    contact: Dict[str, Any] = Field(default_factory=dict)
    social_links: Dict[str, Any] = Field(default_factory=dict)
    footer: Dict[str, Any] = Field(default_factory=dict)
    coupons: List[Dict[str, Any]] = Field(default_factory=list)
    seo: Dict[str, Any] = Field(default_factory=dict)
    theme: Dict[str, Any] = Field(default_factory=dict)
    website_settings: Dict[str, Any] = Field(default_factory=dict)


class CartItemIn(BaseModel):
    product_id: str
    quantity: int = 1


class AddressIn(BaseModel):
    full_name: str
    phone: str
    email: EmailStr
    address: str
    city: str
    state: str
    pin_code: str


class CheckoutIn(BaseModel):
    address: AddressIn
    payment_method: str = 'COD'


class ComparisonIn(BaseModel):
    name: str
    product_ids: List[str]
    spec_keys: List[str] = []


@api.post('/auth/register')
async def register(body: RegisterIn, response: Response):
    email = body.email.lower()
    if await db.users.find_one({'email': email}):
        raise HTTPException(400, 'Email already registered')
    uid = new_id()
    doc = {
        'id': uid,
        'email': email,
        'name': body.name,
        'password_hash': hash_pw(body.password),
        'role': 'customer',
        'created_at': now_iso(),
        'addresses': [],
    }
    await db.users.insert_one(doc)
    token = create_token(uid, email, 'customer')
    return {'user': strip_doc(doc), 'token': token}


@api.post('/auth/login')
async def login(body: LoginIn):
    email = body.email.lower()
    user = await db.users.find_one({'email': email})
    if not user or not verify_pw(body.password, user['password_hash']):
        raise HTTPException(401, 'Invalid email or password')
    token = create_token(user['id'], email, user['role'])
    return {'user': strip_doc(dict(user)), 'token': token}


@api.get('/auth/me')
async def me(user=Depends(require_user)):
    return user


@api.get('/content')
async def get_content():
    doc = await db.site_content.find_one({'id': 'site-content'}, {'_id': 0})
    return merge_site_content(doc)


@api.get('/categories')
async def list_categories():
    return await db.categories.find({'visible': True}, {'_id': 0}).sort('order', 1).to_list(500)


@api.get('/admin/categories')
async def admin_list_categories(_=Depends(require_admin)):
    return await db.categories.find({}, {'_id': 0}).sort('order', 1).to_list(500)


@api.post('/admin/categories')
async def create_category(body: CategoryIn, _=Depends(require_admin)):
    doc = body.model_dump()
    doc['id'] = new_id()
    doc['slug'] = doc.get('slug') or slugify(doc['name'])
    doc['created_at'] = now_iso()
    await db.categories.insert_one(doc)
    return doc


@api.put('/admin/categories/{cid}')
async def update_category(cid: str, body: CategoryIn, _=Depends(require_admin)):
    data = body.model_dump()
    data['slug'] = data.get('slug') or slugify(data['name'])
    data['updated_at'] = now_iso()
    result = await db.categories.update_one({'id': cid}, {'$set': data})
    if not update_touched(result) and not await db.categories.find_one({'id': cid}):
        raise HTTPException(404, 'Category not found')
    return await db.categories.find_one({'id': cid}, {'_id': 0})


@api.delete('/admin/categories/{cid}')
async def delete_category(cid: str, _=Depends(require_admin)):
    await db.categories.delete_one({'id': cid})
    return {'ok': True}


@api.get('/subcategories')
async def list_subcategories(category: Optional[str] = None):
    query: Dict[str, Any] = {'visible': True}
    if category:
        query['category_id'] = category
    return await db.subcategories.find(query, {'_id': 0}).sort('order', 1).to_list(500)


@api.get('/admin/subcategories')
async def admin_list_subcategories(_=Depends(require_admin)):
    return await db.subcategories.find({}, {'_id': 0}).sort('order', 1).to_list(500)


@api.post('/admin/subcategories')
async def create_subcategory(body: SubcategoryIn, _=Depends(require_admin)):
    if not await db.categories.find_one({'id': body.category_id}):
        raise HTTPException(400, 'Category not found')
    doc = body.model_dump()
    doc['id'] = new_id()
    doc['slug'] = doc.get('slug') or slugify(doc['name'])
    doc['created_at'] = now_iso()
    await db.subcategories.insert_one(doc)
    return doc


@api.put('/admin/subcategories/{sid}')
async def update_subcategory(sid: str, body: SubcategoryIn, _=Depends(require_admin)):
    if not await db.categories.find_one({'id': body.category_id}):
        raise HTTPException(400, 'Category not found')
    data = body.model_dump()
    data['slug'] = data.get('slug') or slugify(data['name'])
    data['updated_at'] = now_iso()
    result = await db.subcategories.update_one({'id': sid}, {'$set': data})
    if not update_touched(result) and not await db.subcategories.find_one({'id': sid}):
        raise HTTPException(404, 'Subcategory not found')
    return await db.subcategories.find_one({'id': sid}, {'_id': 0})


@api.delete('/admin/subcategories/{sid}')
async def delete_subcategory(sid: str, _=Depends(require_admin)):
    await db.subcategories.delete_one({'id': sid})
    return {'ok': True}


@api.get('/brands')
async def list_brands():
    return await db.brands.find({'visible': True}, {'_id': 0}).to_list(500)


@api.get('/admin/brands')
async def admin_list_brands(_=Depends(require_admin)):
    return await db.brands.find({}, {'_id': 0}).to_list(500)


@api.post('/admin/brands')
async def create_brand(body: BrandIn, _=Depends(require_admin)):
    doc = body.model_dump()
    doc['id'] = new_id()
    doc['slug'] = doc.get('slug') or slugify(doc['name'])
    doc['created_at'] = now_iso()
    await db.brands.insert_one(doc)
    return doc


@api.put('/admin/brands/{bid}')
async def update_brand(bid: str, body: BrandIn, _=Depends(require_admin)):
    data = body.model_dump()
    data['slug'] = data.get('slug') or slugify(data['name'])
    data['updated_at'] = now_iso()
    result = await db.brands.update_one({'id': bid}, {'$set': data})
    if not update_touched(result) and not await db.brands.find_one({'id': bid}):
        raise HTTPException(404, 'Brand not found')
    return await db.brands.find_one({'id': bid}, {'_id': 0})


@api.delete('/admin/brands/{bid}')
async def delete_brand(bid: str, _=Depends(require_admin)):
    await db.brands.delete_one({'id': bid})
    return {'ok': True}


async def hydrate_product(p: Dict[str, Any]) -> Dict[str, Any]:
    p.pop('_id', None)
    normalize_badges(p)
    p['brand'] = await db.brands.find_one({'id': p.get('brand_id')}, {'_id': 0})
    p['category'] = await db.categories.find_one({'id': p.get('category_id')}, {'_id': 0})
    p['subcategory'] = await db.subcategories.find_one({'id': p.get('subcategory_id')}, {'_id': 0}) if p.get('subcategory_id') else None
    return p


@api.get('/products')
async def list_products(
    q: Optional[str] = None,
    category: Optional[str] = None,
    subcategory: Optional[str] = None,
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    badge: Optional[str] = None,
    limit: int = 60,
):
    query: Dict[str, Any] = {'visible': True}
    if category:
        query['category_id'] = category
    if subcategory:
        query['subcategory_id'] = subcategory
    if brand:
        query['brand_id'] = brand
    if badge:
        query['badges'] = badge
    if min_price is not None or max_price is not None:
        pr = {}
        if min_price is not None:
            pr['$gte'] = min_price
        if max_price is not None:
            pr['$lte'] = max_price
        query['price'] = pr
    if q:
        regex = {'$regex': q, '$options': 'i'}
        query['$or'] = [
            {'name': regex},
            {'model_number': regex},
            {'description': regex},
            {'highlights': regex},
        ]
    items = await db.products.find(query, {'_id': 0}).limit(limit).to_list(limit)
    brands = {b['id']: b for b in await db.brands.find({}, {'_id': 0}).to_list(1000)}
    cats = {c['id']: c for c in await db.categories.find({}, {'_id': 0}).to_list(1000)}
    subcats = {s['id']: s for s in await db.subcategories.find({}, {'_id': 0}).to_list(1000)}
    for p in items:
        normalize_badges(p)
        p['brand'] = brands.get(p.get('brand_id'))
        p['category'] = cats.get(p.get('category_id'))
        p['subcategory'] = subcats.get(p.get('subcategory_id'))
    return items


@api.get('/products/{pid}')
async def get_product(pid: str):
    p = await db.products.find_one({'id': pid}, {'_id': 0})
    if not p:
        raise HTTPException(404, 'Product not found')
    return await hydrate_product(p)


@api.get('/admin/products')
async def admin_list_products(_=Depends(require_admin)):
    items = await db.products.find({}, {'_id': 0}).to_list(1000)
    brands = {b['id']: b for b in await db.brands.find({}, {'_id': 0}).to_list(1000)}
    cats = {c['id']: c for c in await db.categories.find({}, {'_id': 0}).to_list(1000)}
    subcats = {s['id']: s for s in await db.subcategories.find({}, {'_id': 0}).to_list(1000)}
    for p in items:
        normalize_badges(p)
        p['brand'] = brands.get(p.get('brand_id'))
        p['category'] = cats.get(p.get('category_id'))
        p['subcategory'] = subcats.get(p.get('subcategory_id'))
    return items


@api.post('/admin/products')
async def create_product(body: ProductIn, _=Depends(require_admin)):
    doc = normalize_badges(body.model_dump())
    doc['id'] = new_id()
    doc['created_at'] = now_iso()
    await db.products.insert_one(doc)
    return doc


@api.put('/admin/products/{pid}')
async def update_product(pid: str, body: ProductIn, _=Depends(require_admin)):
    data = normalize_badges(body.model_dump())
    data['updated_at'] = now_iso()
    result = await db.products.update_one({'id': pid}, {'$set': data})
    if not update_touched(result) and not await db.products.find_one({'id': pid}):
        raise HTTPException(404, 'Product not found')
    updated = await db.products.find_one({'id': pid}, {'_id': 0})
    return normalize_badges(updated) if updated else None


@api.delete('/admin/products/{pid}')
async def delete_product(pid: str, _=Depends(require_admin)):
    await db.products.delete_one({'id': pid})
    return {'ok': True}


@api.get('/cart')
async def get_cart(user=Depends(require_user)):
    items = await db.cart.find({'user_id': user['id']}, {'_id': 0}).to_list(200)
    for it in items:
        it['product'] = await db.products.find_one({'id': it['product_id']}, {'_id': 0})
    return items


@api.post('/cart/add')
async def add_cart(body: CartItemIn, user=Depends(require_user)):
    existing = await db.cart.find_one({'user_id': user['id'], 'product_id': body.product_id})
    if existing:
        await db.cart.update_one({'id': existing['id']}, {'$inc': {'quantity': body.quantity}})
        return {'ok': True}
    doc = {'id': new_id(), 'user_id': user['id'], 'product_id': body.product_id, 'quantity': body.quantity, 'created_at': now_iso()}
    await db.cart.insert_one(doc)
    return {'ok': True}


@api.put('/cart/{cid}')
async def update_cart_qty(cid: str, qty: int = Query(...), user=Depends(require_user)):
    if qty <= 0:
        await db.cart.delete_one({'id': cid, 'user_id': user['id']})
        return {'ok': True}
    await db.cart.update_one({'id': cid, 'user_id': user['id']}, {'$set': {'quantity': qty}})
    return {'ok': True}


@api.delete('/cart/{cid}')
async def remove_cart(cid: str, user=Depends(require_user)):
    await db.cart.delete_one({'id': cid, 'user_id': user['id']})
    return {'ok': True}


@api.post('/orders')
async def create_order(body: CheckoutIn, user=Depends(require_user)):
    items = await db.cart.find({'user_id': user['id']}, {'_id': 0}).to_list(200)
    if not items:
        raise HTTPException(400, 'Cart is empty')

    order_items = []
    subtotal = 0.0
    for it in items:
        p = await db.products.find_one({'id': it['product_id']}, {'_id': 0})
        if not p:
            continue
        if p.get('stock', 0) < it['quantity']:
            raise HTTPException(400, f"Insufficient stock for {p['name']}")
        line = p['price'] * it['quantity']
        subtotal += line
        order_items.append({
            'product_id': p['id'],
            'name': p['name'],
            'image': (p.get('images') or [None])[0],
            'brand': p.get('brand_id'),
            'price': p['price'],
            'quantity': it['quantity'],
            'line_total': line,
        })

    gst = round(subtotal * 0.18, 2)
    shipping = 199
    total = round(subtotal + gst + shipping, 2)
    order = {
        'id': new_id(),
        'user_id': user['id'],
        'items': order_items,
        'subtotal': round(subtotal, 2),
        'gst': gst,
        'shipping': shipping,
        'total': total,
        'address': body.address.model_dump(),
        'payment_method': body.payment_method,
        'status': 'Pending',
        'created_at': now_iso(),
    }
    await db.orders.insert_one(order)
    for it in items:
        await db.products.update_one({'id': it['product_id']}, {'$inc': {'stock': -it['quantity']}})
    await db.cart.delete_many({'user_id': user['id']})
    return order


@api.get('/orders/me')
async def my_orders(user=Depends(require_user)):
    return await db.orders.find({'user_id': user['id']}, {'_id': 0}).sort('created_at', -1).to_list(200)


@api.get('/admin/orders')
async def admin_orders(_=Depends(require_admin)):
    return await db.orders.find({}, {'_id': 0}).sort('created_at', -1).to_list(500)


@api.put('/admin/orders/{oid}')
async def update_order_status(oid: str, status: str = Query(...), _=Depends(require_admin)):
    await db.orders.update_one({'id': oid}, {'$set': {'status': status}})
    return await db.orders.find_one({'id': oid}, {'_id': 0})


@api.get('/admin/content')
async def admin_get_content(_=Depends(require_admin)):
    doc = await db.site_content.find_one({'id': 'site-content'}, {'_id': 0})
    return merge_site_content(doc)


@api.put('/admin/content')
async def admin_update_content(body: SiteContentIn, _=Depends(require_admin)):
    data = merge_site_content(body.model_dump())
    data['id'] = 'site-content'
    data['updated_at'] = now_iso()
    existing = await db.site_content.find_one({'id': 'site-content'})
    if existing:
        await db.site_content.update_one({'id': 'site-content'}, {'$set': data})
    else:
        data['created_at'] = now_iso()
        await db.site_content.insert_one(data)
    return data


@api.get('/admin/media')
async def admin_list_media(_=Depends(require_admin)):
    return await db.media.find({}, {'_id': 0}).sort('created_at', -1).to_list(1000)


if HAS_MULTIPART:
    @api.post('/admin/uploads')
    async def admin_upload_media(request: Request, file: UploadFile = File(...), _=Depends(require_admin)):
        content_type = (file.content_type or '').split(';')[0].lower()
        if content_type not in ALLOWED_UPLOAD_TYPES:
            allowed = ', '.join(sorted(ALLOWED_UPLOAD_TYPES))
            raise HTTPException(400, f'Unsupported file type. Allowed types: {allowed}')

        data = await file.read(UPLOAD_MAX_BYTES + 1)
        if len(data) > UPLOAD_MAX_BYTES:
            raise HTTPException(413, f'File too large. Max upload size is {UPLOAD_MAX_BYTES // (1024 * 1024)} MB')
        if not data:
            raise HTTPException(400, 'Uploaded file is empty')

        ext = ALLOWED_UPLOAD_TYPES[content_type]
        original_ext = Path(file.filename or '').suffix.lower()
        if content_type == 'image/jpeg' and original_ext in {'.jpg', '.jpeg'}:
            ext = original_ext
        filename = f'{uuid.uuid4().hex}{ext}'
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        target = UPLOAD_DIR / filename
        target.write_bytes(data)

        doc = {
            'id': new_id(),
            'filename': filename,
            'original_name': Path(file.filename or filename).name,
            'content_type': content_type,
            'size': len(data),
            'url': f"{str(request.base_url).rstrip('/')}/api/uploads/{filename}",
            'created_at': now_iso(),
        }
        await db.media.insert_one(doc)
        return doc
else:
    @api.post('/admin/uploads')
    async def admin_upload_media_missing_dependency(_=Depends(require_admin)):
        raise HTTPException(503, 'Media uploads require python-multipart. Install backend requirements and restart the server.')


@api.delete('/admin/uploads/{filename}')
async def admin_delete_upload(filename: str, _=Depends(require_admin)):
    safe_name = Path(filename).name
    if safe_name != filename:
        raise HTTPException(400, 'Invalid filename')
    target = UPLOAD_DIR / safe_name
    if target.exists():
        target.unlink()
    await db.media.delete_one({'filename': safe_name})
    return {'ok': True}


@api.get('/comparisons')
async def list_comparisons():
    return await db.comparisons.find({}, {'_id': 0}).to_list(200)


@api.get('/comparisons/by-product/{pid}')
async def comparisons_for_product(pid: str):
    items = await db.comparisons.find({'product_ids': pid}, {'_id': 0}).to_list(20)
    for comp in items:
        products = []
        for p_id in comp['product_ids']:
            p = await db.products.find_one({'id': p_id}, {'_id': 0})
            if p:
                products.append(await hydrate_product(p))
        comp['products'] = products
    return items


@api.post('/admin/comparisons')
async def create_comparison(body: ComparisonIn, _=Depends(require_admin)):
    doc = body.model_dump()
    doc['id'] = new_id()
    doc['created_at'] = now_iso()
    await db.comparisons.insert_one(doc)
    return doc


@api.put('/admin/comparisons/{cid}')
async def update_comparison(cid: str, body: ComparisonIn, _=Depends(require_admin)):
    await db.comparisons.update_one({'id': cid}, {'$set': body.model_dump()})
    return await db.comparisons.find_one({'id': cid}, {'_id': 0})


@api.delete('/admin/comparisons/{cid}')
async def delete_comparison(cid: str, _=Depends(require_admin)):
    await db.comparisons.delete_one({'id': cid})
    return {'ok': True}


@api.get('/admin/stats')
async def admin_stats(_=Depends(require_admin)):
    total_products = await db.products.count_documents({})
    total_orders = await db.orders.count_documents({})
    pending = await db.orders.count_documents({'status': 'Pending'})
    customers = await db.users.count_documents({'role': 'customer'})
    low_stock = await db.products.count_documents({'stock': {'$lt': 5}})
    rev_docs = await db.orders.aggregate([{'$group': {'_id': None, 'rev': {'$sum': '$total'}}}]).to_list(1)
    revenue = rev_docs[0]['rev'] if rev_docs else 0
    series = []
    today = datetime.now(timezone.utc).date()
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        next_day = day + timedelta(days=1)
        docs = await db.orders.aggregate([
            {'$match': {'created_at': {'$gte': day.isoformat(), '$lt': next_day.isoformat()}}},
            {'$group': {'_id': None, 'rev': {'$sum': '$total'}, 'count': {'$sum': 1}}},
        ]).to_list(1)
        series.append({
            'date': day.strftime('%b %d'),
            'revenue': docs[0]['rev'] if docs else 0,
            'orders': docs[0]['count'] if docs else 0,
        })
    return {
        'total_products': total_products,
        'total_orders': total_orders,
        'pending_orders': pending,
        'customers': customers,
        'low_stock': low_stock,
        'revenue': revenue,
        'series': series,
    }


@api.get('/')
async def root():
    return {'ok': True, 'service': 'shradhasales', 'database': DB_BACKEND}


app.include_router(api)
app.mount('/api/uploads', StaticFiles(directory=str(UPLOAD_DIR), check_dir=False), name='uploads')
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

SEED_CATEGORIES = [
    {'name': 'Refrigerators', 'image': 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&q=80', 'description': 'Single & double door refrigerators'},
    {'name': 'Deep Freezers', 'image': 'https://images.unsplash.com/photo-1613083042976-463bdde9ec51?w=600&q=80', 'description': 'Hard-top & glass-top deep freezers'},
    {'name': 'Air Conditioners', 'image': 'https://images.unsplash.com/photo-1759262151046-b91fa96e4006?w=600&q=80', 'description': 'Split, window & cassette ACs'},
    {'name': 'Water Coolers', 'image': 'https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?w=600&q=80', 'description': 'Commercial water coolers'},
    {'name': 'Visi Coolers', 'image': 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&q=80', 'description': 'Single & double door visi coolers'},
    {'name': 'Bakery Equipment', 'image': 'https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?w=600&q=80', 'description': 'Ovens, mixers & display'},
]

SEED_BRANDS = [
    {'name': 'Blue Star', 'logo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Blue_Star_logo.svg/512px-Blue_Star_logo.svg.png'},
    {'name': 'LG', 'logo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/LG_logo_%282015%29.svg/512px-LG_logo_%282015%29.svg.png'},
    {'name': 'Samsung', 'logo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/512px-Samsung_Logo.svg.png'},
    {'name': 'Voltas', 'logo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Voltas_logo.svg/512px-Voltas_logo.svg.png'},
    {'name': 'Whirlpool', 'logo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Whirlpool_Corporation_logo_2017.svg/512px-Whirlpool_Corporation_logo_2017.svg.png'},
    {'name': 'Godrej', 'logo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Godrej_Logo.png/512px-Godrej_Logo.png'},
]

SEED_PRODUCTS = [
    {'name': 'Blue Star 320L Commercial Water Cooler', 'brand': 'Blue Star', 'category': 'Water Coolers', 'model_number': 'WFCL320', 'price': 38999, 'mrp': 45999, 'discount_percent': 15, 'stock': 12, 'rating': 4.4, 'images': ['https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?w=900&q=80'], 'badges': ['bestseller', 'featured'], 'highlights': ['320L Cooling Capacity', 'Stainless Steel Body', 'Energy Star Rated', 'Built-in Filter'], 'description': 'Heavy duty commercial water cooler ideal for offices, schools & factories.', 'specifications': {'Capacity': '320 L', 'Cooling Technology': 'Vapour Compression', 'Energy Rating': '4 Star', 'Power': '550 W', 'Compressor': 'Hermetically Sealed', 'Voltage': '230V/50Hz', 'Water Storage': '80 L', 'Dimensions': '650x550x1240 mm', 'Weight': '82 kg', 'Body Material': 'Stainless Steel 304', 'Temperature Range': '5-15°C', 'Warranty': '1 Year + 5 Year Compressor', 'Color': 'Silver'}},
    {'name': 'LG 300L Frost Free Water Cooler', 'brand': 'LG', 'category': 'Water Coolers', 'model_number': 'LGW300FF', 'price': 35499, 'mrp': 41000, 'discount_percent': 13, 'stock': 8, 'rating': 4.3, 'images': ['https://images.unsplash.com/photo-1593005510509-d05b264f1c9c?w=900&q=80'], 'badges': ['offer'], 'highlights': ['300L Storage', 'Smart Inverter', 'Anti-Bacterial Tank', 'Low Noise'], 'description': 'Premium water cooler with smart inverter efficiency.', 'specifications': {'Capacity': '300 L', 'Cooling Technology': 'Smart Inverter', 'Energy Rating': '5 Star', 'Power': '500 W', 'Compressor': 'Inverter', 'Voltage': '230V/50Hz', 'Water Storage': '75 L', 'Dimensions': '640x540x1230 mm', 'Weight': '78 kg', 'Body Material': 'GI Powder Coated', 'Temperature Range': '6-16°C', 'Warranty': '2 Years', 'Color': 'Steel Grey'}},
    {'name': 'Whirlpool 250L Visi Cooler Single Door', 'brand': 'Whirlpool', 'category': 'Visi Coolers', 'model_number': 'WPV250SD', 'price': 28999, 'mrp': 33999, 'discount_percent': 15, 'stock': 15, 'rating': 4.2, 'images': ['https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=900&q=80'], 'badges': ['new'], 'highlights': ['250L Capacity', 'LED Lighting', 'Double Glass Door', 'Tropical Design'], 'description': 'Display cooler built for retail visibility.', 'specifications': {'Capacity': '250 L', 'Cooling Technology': 'Static', 'Energy Rating': '3 Star', 'Power': '180 W', 'Compressor': 'Embraco', 'Voltage': '230V', 'Dimensions': '610x580x1530 mm', 'Weight': '60 kg', 'Body Material': 'GI Sheet', 'Temperature Range': '2-8°C', 'Warranty': '1 Year', 'Color': 'White'}},
    {'name': 'Samsung 500L Double Door Refrigerator', 'brand': 'Samsung', 'category': 'Refrigerators', 'model_number': 'RT49K6338SL', 'price': 54999, 'mrp': 62999, 'discount_percent': 12, 'stock': 6, 'rating': 4.5, 'images': ['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=900&q=80'], 'badges': ['featured', 'bestseller'], 'highlights': ['500L Capacity', 'Digital Inverter', 'Twin Cooling Plus', '5 Star Energy Rating'], 'description': 'Large refrigerator with intelligent cooling and sleek finish.', 'specifications': {'Capacity': '500 L', 'Cooling Technology': 'Twin Cooling Plus', 'Energy Rating': '5 Star', 'Power': '180 W', 'Compressor': 'Digital Inverter', 'Voltage': '230V', 'Dimensions': '700x720x1850 mm', 'Weight': '85 kg', 'Body Material': 'Metal', 'Temperature Range': '0-8°C', 'Warranty': '1 Year + 10 Year Compressor', 'Color': 'Silver'}},
]

@app.on_event('startup')
async def seed():
    global db, DB_BACKEND
    try:
        await client.admin.command('ping')
        DB_BACKEND = 'mongo'
    except Exception as exc:
        logger.warning('MongoDB unavailable, using local JSON store: %s', exc)
        db = LocalDatabase(ROOT_DIR / 'local_db.json')
        DB_BACKEND = 'local_json'

    await db.users.create_index('email', unique=True)
    await db.products.create_index('name')
    await db.subcategories.create_index('category_id')
    await db.site_content.create_index('id')
    await db.media.create_index('filename')
    await db.cart.create_index('user_id')
    await db.orders.create_index('user_id')

    admin_email = os.environ.get('ADMIN_EMAIL', 'admin@shradhasales.com').lower()
    admin_pw = os.environ.get('ADMIN_PASSWORD', 'admin123')
    existing = await db.users.find_one({'email': admin_email})
    if not existing:
        await db.users.insert_one({
            'id': new_id(),
            'email': admin_email,
            'name': 'Admin',
            'password_hash': hash_pw(admin_pw),
            'role': 'admin',
            'created_at': now_iso(),
        })
        logger.info('Seeded admin user')
    elif not verify_pw(admin_pw, existing['password_hash']):
        await db.users.update_one({'email': admin_email}, {'$set': {'password_hash': hash_pw(admin_pw)}})

    if not await db.users.find_one({'email': 'customer@test.com'}):
        await db.users.insert_one({
            'id': new_id(),
            'email': 'customer@test.com',
            'name': 'Test Customer',
            'password_hash': hash_pw('customer123'),
            'role': 'customer',
            'created_at': now_iso(),
        })

    category_ids = {}
    for idx, cat in enumerate(SEED_CATEGORIES):
        existing = await db.categories.find_one({'name': cat['name']})
        if existing:
            category_ids[cat['name']] = existing['id']
            continue
        doc = {**cat, 'id': new_id(), 'slug': slugify(cat['name']), 'visible': True, 'order': idx, 'created_at': now_iso()}
        await db.categories.insert_one(doc)
        category_ids[cat['name']] = doc['id']

    brand_ids = {}
    for idx, brand in enumerate(SEED_BRANDS):
        existing = await db.brands.find_one({'name': brand['name']})
        if existing:
            brand_ids[brand['name']] = existing['id']
            continue
        doc = {**brand, 'id': new_id(), 'slug': slugify(brand['name']), 'visible': True, 'created_at': now_iso()}
        await db.brands.insert_one(doc)
        brand_ids[brand['name']] = doc['id']

    if await db.products.count_documents({}) == 0:
        for p in SEED_PRODUCTS:
            await db.products.insert_one({
                'id': new_id(),
                'name': p['name'],
                'brand_id': brand_ids[p['brand']],
                'category_id': category_ids[p['category']],
                'model_number': p['model_number'],
                'description': p['description'],
                'highlights': p['highlights'],
                'images': p['images'],
                'price': p['price'],
                'mrp': p['mrp'],
                'discount_percent': p['discount_percent'],
                'gst_percent': 18,
                'stock': p['stock'],
                'sku': p['model_number'],
                'subcategory_id': '',
                'videos': [],
                'warranty': p['specifications'].get('Warranty', '1 Year'),
                'delivery_info': 'Delivered in 5-7 business days',
                'specifications': p['specifications'],
                'rating': p['rating'],
                'badges': p['badges'],
                'featured': 'featured' in p['badges'],
                'bestseller': 'bestseller' in p['badges'],
                'new_arrival': 'new' in p['badges'],
                'offer': 'offer' in p['badges'],
                'visible': True,
                'created_at': now_iso(),
            })
        logger.info('Seeded demo products')

    if not await db.site_content.find_one({'id': 'site-content'}):
        await db.site_content.insert_one({**DEFAULT_SITE_CONTENT, 'created_at': now_iso()})


@app.on_event('shutdown')
async def shutdown():
    client.close()
