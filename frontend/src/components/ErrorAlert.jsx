function ErrorAlert({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="max-w-md mx-auto my-10 p-4 bg-red-900/30 border border-red-800 rounded-lg text-center">
      <p className="text-red-300 text-sm mb-3">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-1.5 text-sm font-medium text-white bg-red-700 hover:bg-red-600 rounded-md transition-colors cursor-pointer"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

export default ErrorAlert
