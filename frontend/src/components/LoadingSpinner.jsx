function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin mb-4"></div>
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  )
}

export default LoadingSpinner
