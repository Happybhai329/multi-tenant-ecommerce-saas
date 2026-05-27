function EmptyState({ title = 'No results found', message = 'Try adjusting your search or filters.' }) {
  return (
    <div className="text-center py-20">
      <div className="text-4xl mb-4">📭</div>
      <h3 className="text-lg font-medium text-gray-300 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  )
}

export default EmptyState
