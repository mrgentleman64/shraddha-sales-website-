export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-[1rem] border border-slate-300/80 bg-white/95 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-400 focus:border-navy focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${props.className || ''}`}
    />
  );
}
