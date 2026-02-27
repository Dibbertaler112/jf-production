export default function SectionCard({ title, children }) {
  return (
    <div className="bg-[#1e293b] p-6 rounded-xl border border-slate-700">
      <h2 className="text-lg font-semibold mb-4">
        {title}
      </h2>
      {children}
    </div>
  )
}