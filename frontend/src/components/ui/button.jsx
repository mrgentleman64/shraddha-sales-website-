import clsx from 'clsx';

export function Button({ children, className, variant = 'solid', size = 'md', asChild, ...props }) {
  const classes = clsx(
    'inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
    variant === 'solid' && 'bg-navy text-white hover:bg-slate-800',
    variant === 'outline' && 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-100',
    variant === 'ghost' && 'bg-transparent text-slate-700 hover:text-navy',
    size === 'sm' && 'h-9 px-3 text-sm',
    size === 'md' && 'h-11 px-4 text-sm',
    size === 'lg' && 'h-12 px-5 text-base',
    className,
  );

  if (asChild) {
    return <button className={classes} {...props}>{children}</button>;
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
