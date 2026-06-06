function ActiveFilters({ search, category, sort, onClearSearch, onClearCategory, onClearSort, onClearAll }) {
  const hasSearch = !!search
  const hasCategory = !!category
  const hasSort = sort && sort !== 'newest'
  const hasAny = hasSearch || hasCategory || hasSort

  if (!hasAny) return null

  const sortLabels = {
    price_asc: 'Price: Low → High',
    price_desc: 'Price: High → Low',
    rating: 'Highest Rated',
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Active filters:</span>

      {hasSearch && (
        <FilterPill label={`Search: "${search}"`} onRemove={onClearSearch} />
      )}

      {hasCategory && (
        <FilterPill label={`Category: ${category}`} onRemove={onClearCategory} />
      )}

      {hasSort && (
        <FilterPill label={`Sort: ${sortLabels[sort] || sort}`} onRemove={onClearSort} />
      )}

      <button
        onClick={onClearAll}
        className="text-xs text-red-400 hover:text-red-300 ml-1 transition-colors cursor-pointer"
      >
        Clear all
      </button>
    </div>
  )
}

function FilterPill({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-800 border border-gray-700 rounded-full text-xs text-gray-300">
      {label}
      <button
        onClick={onRemove}
        className="text-gray-500 hover:text-white transition-colors cursor-pointer"
        aria-label={`Remove filter: ${label}`}
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  )
}

export default ActiveFilters
