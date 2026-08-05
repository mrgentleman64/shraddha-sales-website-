export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-navy focus:ring-2 focus:ring-blue-200 ${props.className || ''}`}
    />
  );
}
