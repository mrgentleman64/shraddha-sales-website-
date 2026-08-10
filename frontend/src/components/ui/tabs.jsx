import { Children, cloneElement, useState } from 'react';

export function Tabs({ children, defaultValue }) {
  const [active, setActive] = useState(defaultValue);
  return (
    <div data-active-tab={active}>
      {Children.map(children, (child) => {
        if (!child) return null;
        return cloneElement(child, { active, setActive });
      })}
    </div>
  );
}

export function TabsList({ children, className }) {
  return <div className={`inline-flex flex-wrap rounded-2xl border border-slate-200 bg-slate-100/80 p-1 ${className || ''}`}>{children}</div>;
}

export function TabsTrigger({ value, active, setActive, children, className }) {
  return (
    <button type="button" onClick={() => setActive(value)} className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${active === value ? 'bg-white text-navy shadow-sm' : 'text-slate-500 hover:bg-white/70 hover:text-slate-900'} ${className || ''}`}>
      {children}
    </button>
  );
}

export function TabsContent({ value, active, children, className }) {
  return active === value ? <div className={className}>{children}</div> : null;
}
