import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-2">404</h1>
        <p className="text-gray-400 mb-6">Page not found</p>
        <Link to="/" className="text-indigo-400 hover:text-indigo-300">
          ← Back home
        </Link>
      </div>
    </div>
  )
}

export default NotFound
