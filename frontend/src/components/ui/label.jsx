export function Label({ children, className, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className={`mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-600 ${className || ''}`}>
      {children}
    </label>
  );
}
