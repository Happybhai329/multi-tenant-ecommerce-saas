import { lazy, Suspense } from 'react'

const DashboardChartRenderer = lazy(() => import('./DashboardChartRenderer'))

function ChartLoader({ height, message = 'Loading chart...' }) {
  return (
    <div className="flex items-center justify-center" style={{ height }}>
      <div className="text-center">
        <div className="w-6 h-6 border-2 border-gray-600 border-t-emerald-400 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-gray-500 mt-3">{message}</p>
      </div>
    </div>
  )
}

function ChartEmptyState({ height, message }) {
  return (
    <div className="flex items-center justify-center" style={{ height }}>
      <div className="text-center px-4">
        <svg className="w-10 h-10 text-gray-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
        <p className="text-sm text-gray-500">{message}</p>
      </div>
    </div>
  )
}

function DashboardChart({
  title,
  data,
  dataKey,
  xAxisKey = 'label',
  type = 'area',
  color = 'emerald',
  height = 280,
  loading,
  emptyMessage,
  formatter,
  yAxisFormatter,
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>

      <div className="p-4">
        {loading ? (
          <ChartLoader height={height} />
        ) : !data || data.length === 0 ? (
          <ChartEmptyState height={height} message={emptyMessage || 'No chart data available'} />
        ) : (
          <Suspense fallback={<ChartLoader height={height} message="Preparing chart..." />}>
            <DashboardChartRenderer
              data={data}
              dataKey={dataKey}
              xAxisKey={xAxisKey}
              type={type}
              color={color}
              height={height}
              formatter={formatter}
              yAxisFormatter={yAxisFormatter}
            />
          </Suspense>
        )}
      </div>
    </div>
  )
}

export default DashboardChart
