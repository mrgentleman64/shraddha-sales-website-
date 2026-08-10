import clsx from 'clsx';

export function Button({ children, className, variant = 'solid', size = 'md', asChild, ...props }) {
  const classes = clsx(
    'group relative inline-flex items-center justify-center overflow-hidden rounded-[1rem] font-semibold tracking-[-0.01em] transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 active:translate-y-px disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55',
    'before:absolute before:inset-0 before:translate-y-full before:bg-white/14 before:transition-transform before:duration-300 hover:before:translate-y-0',
    variant === 'solid' && 'bg-navy text-white shadow-[0_12px_28px_rgba(30,58,138,0.24)] hover:bg-blue-950 hover:shadow-[0_16px_36px_rgba(30,58,138,0.3)]',
    variant === 'outline' && 'border border-slate-300/80 bg-white/90 text-slate-900 shadow-sm hover:border-navy/30 hover:bg-blue-50/70 hover:text-navy',
    variant === 'ghost' && 'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-navy',
    variant === 'secondary' && 'bg-teal text-white shadow-[0_12px_28px_rgba(15,118,110,0.22)] hover:bg-teal-800',
    variant === 'danger' && 'bg-red-600 text-white shadow-[0_12px_28px_rgba(220,38,38,0.2)] hover:bg-red-700',
    size === 'sm' && 'h-9 px-3.5 text-xs',
    size === 'md' && 'h-11 px-5 text-sm',
    size === 'lg' && 'h-12 px-6 text-sm sm:text-base',
    className,
  );

  if (asChild) {
    return <button className={classes} {...props}><span className="relative z-10 inline-flex items-center justify-center gap-2">{children}</span></button>;
  }

  return (
    <button className={classes} {...props}>
      <span className="relative z-10 inline-flex items-center justify-center gap-2">{children}</span>
    </button>
  );
}
