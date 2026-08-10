import { SearchX } from 'lucide-react';
import { Button } from './button.jsx';

export function EmptyState({ title, message, actionLabel, onAction, icon: Icon = SearchX }) {
  return (
    <div className="section-panel animate-enter px-6 py-12 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-blue-50 text-navy">
        <Icon size={24} />
      </div>
      <h2 className="mt-5 text-2xl font-bold text-slate-900">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">{message}</p>
      {actionLabel && onAction ? <Button type="button" onClick={onAction} className="mt-6">{actionLabel}</Button> : null}
    </div>
  );
}
