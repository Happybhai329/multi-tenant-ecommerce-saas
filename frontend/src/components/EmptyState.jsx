function EmptyState({ title = 'No results found', message = 'Try adjusting your search or filters.' }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-gray-800 bg-gray-900">
        <svg className="h-7 w-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632A2.25 2.25 0 0117.379 20.25H6.621a2.25 2.25 0 01-2.246-2.118L3.75 7.5M9.75 11.25h4.5M9 7.5V6a3 3 0 116 0v1.5M3.75 7.5h16.5" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-200 mb-2">{title}</h3>
      <p className="mx-auto max-w-sm text-sm leading-6 text-gray-500">{message}</p>
    </div>
  )
}

export default EmptyState
