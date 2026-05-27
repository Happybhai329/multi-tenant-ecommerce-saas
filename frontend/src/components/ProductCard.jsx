import { Link } from 'react-router-dom'

function ProductCard({ product }) {
  const hasImage = product.images && product.images.length > 0 && product.images[0]
  const inStock = product.stock > 0

  return (
    <Link
      to={`/products/${product.slug}`}
      className="block bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors"
    >
      {/* Product Image */}
      <div className="aspect-square bg-gray-800 flex items-center justify-center overflow-hidden">
        {hasImage ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg className="w-12 h-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
          </svg>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-white truncate mb-1">{product.title}</h3>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-semibold text-white">
            ${product.price.toFixed(2)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm text-gray-500 line-through">
              ${product.comparePrice.toFixed(2)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded">
            {product.category}
          </span>
          <span className={`text-xs font-medium ${inStock ? 'text-green-400' : 'text-red-400'}`}>
            {inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        {product.store && (
          <p className="text-xs text-gray-500 mt-2 truncate">
            {product.store.name}
          </p>
        )}
      </div>
    </Link>
  )
}

export default ProductCard
