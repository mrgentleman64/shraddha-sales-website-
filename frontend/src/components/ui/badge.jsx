import clsx from 'clsx';

const variants = {
  default: 'border-slate-200 bg-slate-50 text-slate-700',
  navy: 'border-blue-900/10 bg-blue-50 text-navy',
  accent: 'border-amber-200 bg-amber-50 text-amber-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  danger: 'border-red-200 bg-red-50 text-red-700',
};

export function Badge({ children, className, variant = 'default' }) {
  return (
    <span className={clsx('inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]', variants[variant], className)}>
      {children}
    </span>
  );
}
