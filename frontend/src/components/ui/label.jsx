export function Label({ children, className, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className={`block text-sm font-medium text-slate-700 ${className || ''}`}>
      {children}
    </label>
  );
}
