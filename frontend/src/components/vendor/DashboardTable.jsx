import { Link } from 'react-router-dom'

function DashboardTable({ title, linkTo, linkLabel, columns, rows, emptyMessage, loading, renderRow }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {linkTo && rows?.length > 0 && (
          <Link
            to={linkTo}
            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            {linkLabel || 'View all →'}
          </Link>
        )}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="p-10 text-center">
          <div className="w-6 h-6 border-2 border-gray-600 border-t-emerald-400 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-500 mt-3">Loading...</p>
        </div>
      ) : !rows || rows.length === 0 ? (
        /* Empty state */
        <div className="p-10 text-center">
          <svg className="w-10 h-10 text-gray-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-sm text-gray-500">{emptyMessage || 'No data yet'}</p>
        </div>
      ) : (
        <>
          {/* Table header */}
          {columns && (
            <div className="hidden md:grid px-5 py-2.5 border-b border-gray-800/50 text-xs text-gray-500 uppercase tracking-wider font-semibold"
              style={{ gridTemplateColumns: columns.map(c => c.width || '1fr').join(' ') }}
            >
              {columns.map((col) => (
                <div key={col.key} className={col.align === 'right' ? 'text-right' : ''}>
                  {col.label}
                </div>
              ))}
            </div>
          )}

          {/* Rows */}
          <div className="divide-y divide-gray-800">
            {rows.map((row, index) => renderRow(row, index))}
          </div>
        </>
      )}
    </div>
  )
}

export default DashboardTable
