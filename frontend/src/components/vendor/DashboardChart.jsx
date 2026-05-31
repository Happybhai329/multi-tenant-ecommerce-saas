import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts'

const CHART_COLORS = {
  emerald: { stroke: '#34d399', fill: '#34d399', gradient: ['#34d399', 'transparent'] },
  blue: { stroke: '#60a5fa', fill: '#60a5fa', gradient: ['#60a5fa', 'transparent'] },
  purple: { stroke: '#a78bfa', fill: '#a78bfa', gradient: ['#a78bfa', 'transparent'] },
  yellow: { stroke: '#fbbf24', fill: '#fbbf24', gradient: ['#fbbf24', 'transparent'] },
}

// Custom tooltip matching our dark theme
function CustomTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} className="text-sm font-semibold" style={{ color: entry.color }}>
          {formatter ? formatter(entry.value, entry.name) : entry.value}
        </p>
      ))}
    </div>
  )
}

function DashboardChart({
  title,
  data,
  dataKey,
  xAxisKey = 'label',
  type = 'area', // 'area' | 'bar'
  color = 'emerald',
  height = 280,
  loading,
  emptyMessage,
  formatter,
  yAxisFormatter,
}) {
  const chartColor = CHART_COLORS[color] || CHART_COLORS.emerald
  const gradientId = `gradient-${dataKey}-${color}`

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-gray-600 border-t-emerald-400 rounded-full animate-spin mx-auto" />
              <p className="text-xs text-gray-500 mt-3">Loading chart...</p>
            </div>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="text-center">
              <svg className="w-10 h-10 text-gray-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <p className="text-sm text-gray-500">{emptyMessage || 'No chart data available'}</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            {type === 'area' ? (
              <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor.gradient[0]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColor.gradient[1]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis
                  dataKey={xAxisKey}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickFormatter={yAxisFormatter}
                  dx={-5}
                />
                <Tooltip content={<CustomTooltip formatter={formatter} />} />
                <Area
                  type="monotone"
                  dataKey={dataKey}
                  stroke={chartColor.stroke}
                  strokeWidth={2}
                  fill={`url(#${gradientId})`}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: chartColor.stroke, fill: '#111827' }}
                />
              </AreaChart>
            ) : (
              <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis
                  dataKey={xAxisKey}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickFormatter={yAxisFormatter}
                  dx={-5}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip formatter={formatter} />} />
                <Bar
                  dataKey={dataKey}
                  fill={chartColor.fill}
                  opacity={0.8}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

export default DashboardChart
