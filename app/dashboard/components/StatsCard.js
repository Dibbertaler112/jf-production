export default function StatsCard({ title, value }) {
  return (
    <div
      className="
        bg-[#1e293b]
        p-8
        rounded-3xl
        border border-slate-700
        shadow-xl
        hover:shadow-2xl
        hover:border-[#d9ff00]
        transition-all duration-300
      "
    >
      <p className="text-slate-400 text-xs uppercase tracking-widest">
        {title}
      </p>

      <p className="text-5xl font-black mt-4 text-[#d9ff00]">
        {value}
      </p>
    </div>
  )

  
}