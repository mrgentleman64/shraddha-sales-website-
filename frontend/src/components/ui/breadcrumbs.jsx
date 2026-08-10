import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
      {items.map((item, index) => {
        const last = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
            {item.to && !last ? <Link to={item.to} className="hover:text-navy">{item.label}</Link> : <span className={last ? 'font-medium text-slate-700' : ''}>{item.label}</span>}
            {!last ? <ChevronRight size={14} aria-hidden="true" /> : null}
          </span>
        );
      })}
    </nav>
  );
}
