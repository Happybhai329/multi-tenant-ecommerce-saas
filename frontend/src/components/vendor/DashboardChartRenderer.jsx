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

function CustomTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      {payload.map((entry, idx) => (
        <p key={`${entry.name}-${idx}`} className="text-sm font-semibold" style={{ color: entry.color }}>
          {formatter ? formatter(entry.value, entry.name) : entry.value}
        </p>
      ))}
    </div>
  )
}

function DashboardChartRenderer({
  data,
  dataKey,
  xAxisKey = 'label',
  type = 'area',
  color = 'emerald',
  height = 280,
  formatter,
  yAxisFormatter,
}) {
  const chartColor = CHART_COLORS[color] || CHART_COLORS.emerald
  const gradientId = `gradient-${dataKey}-${color}`

  return (
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
  )
}

export default DashboardChartRenderer
