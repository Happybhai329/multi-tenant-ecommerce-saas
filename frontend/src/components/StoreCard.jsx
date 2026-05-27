import { Link } from 'react-router-dom'

function StoreCard({ store }) {
  const initial = store.name?.charAt(0)?.toUpperCase() || '?'

  return (
    <Link
      to={`/stores/${store.slug}`}
      className="block bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-gray-700 transition-colors"
    >
      <div className="flex items-center gap-4 mb-3">
        {/* Store Logo or Initial */}
        {store.logo ? (
          <img
            src={store.logo}
            alt={store.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-lg">
            {initial}
          </div>
        )}

        <div className="min-w-0">
          <h3 className="text-base font-medium text-white truncate">{store.name}</h3>
        </div>
      </div>

      {store.description && (
        <p className="text-sm text-gray-400 line-clamp-2">
          {store.description}
        </p>
      )}

      {!store.description && (
        <p className="text-sm text-gray-600 italic">No description</p>
      )}
    </Link>
  )
}

export default StoreCard
