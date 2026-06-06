import { useState, useEffect, useRef } from 'react'

function SearchBar({ value = '', onChange, placeholder = 'Search products...', debounceMs = 300 }) {
  const [localValue, setLocalValue] = useState(value)
  const timerRef = useRef(null)
  const isFirstRender = useRef(true)

  // Sync from parent when value prop changes (e.g. clear filters)
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Debounce the onChange callback
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onChange(localValue)
    }, debounceMs)

    return () => clearTimeout(timerRef.current)
  }, [localValue, debounceMs])

  const handleClear = () => {
    setLocalValue('')
    onChange('')
  }

  return (
    <div className="relative flex-1 min-w-0">
      {/* Search Icon */}
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>

      <input
        id="search-bar"
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
      />

      {/* Clear Button */}
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
          aria-label="Clear search"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default SearchBar
