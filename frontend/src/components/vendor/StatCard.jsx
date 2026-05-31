function StatCard({ label, value, icon, color, bg, subtext }) {
  return (
    <div
      className={`${bg} border rounded-xl p-5 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-400 font-medium">{label}</p>
        <span className={`${color} opacity-80`}>{icon}</span>
      </div>
      <p className={`text-3xl font-bold ${color} tracking-tight`}>{value}</p>
      {subtext && (
        <p className="text-xs text-gray-500 mt-1.5">{subtext}</p>
      )}
    </div>
  )
}

export default StatCard
