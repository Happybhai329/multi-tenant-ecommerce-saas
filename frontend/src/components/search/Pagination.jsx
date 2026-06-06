function Pagination({ page = 1, pages = 1, total = 0, onPageChange }) {
  if (pages <= 1) return null

  // Build visible page numbers — show up to 5 pages around current
  const getPageNumbers = () => {
    const numbers = []
    let start = Math.max(1, page - 2)
    let end = Math.min(pages, page + 2)

    // Adjust range to always show 5 numbers when possible
    if (end - start < 4) {
      if (start === 1) {
        end = Math.min(pages, start + 4)
      } else if (end === pages) {
        start = Math.max(1, end - 4)
      }
    }

    for (let i = start; i <= end; i++) {
      numbers.push(i)
    }
    return numbers
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-800">
      {/* Results info */}
      <p className="text-sm text-gray-500">
        Showing page <span className="text-gray-300 font-medium">{page}</span> of{' '}
        <span className="text-gray-300 font-medium">{pages}</span>
        <span className="mx-1">·</span>
        <span className="text-gray-300 font-medium">{total}</span> total results
      </p>

      {/* Navigation */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          id="pagination-prev"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 text-sm rounded-md border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          ← Prev
        </button>

        {/* Page numbers */}
        {pageNumbers[0] > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="w-9 h-9 text-sm rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
            >
              1
            </button>
            {pageNumbers[0] > 2 && (
              <span className="w-9 h-9 flex items-center justify-center text-gray-600 text-sm">…</span>
            )}
          </>
        )}

        {pageNumbers.map((num) => (
          <button
            key={num}
            onClick={() => onPageChange(num)}
            className={`w-9 h-9 text-sm rounded-md transition-colors cursor-pointer ${
              num === page
                ? 'bg-blue-600 text-white font-medium'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {num}
          </button>
        ))}

        {pageNumbers[pageNumbers.length - 1] < pages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < pages - 1 && (
              <span className="w-9 h-9 flex items-center justify-center text-gray-600 text-sm">…</span>
            )}
            <button
              onClick={() => onPageChange(pages)}
              className="w-9 h-9 text-sm rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
            >
              {pages}
            </button>
          </>
        )}

        {/* Next */}
        <button
          id="pagination-next"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="px-3 py-1.5 text-sm rounded-md border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Next →
        </button>
      </div>
    </div>
  )
}

export default Pagination
