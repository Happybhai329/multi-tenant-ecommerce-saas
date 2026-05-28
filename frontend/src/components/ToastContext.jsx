import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

let toastId = 0

const TOAST_STYLES = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-blue-600 text-white',
}

const TOAST_ICONS = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success') => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, type }])

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container — fixed top-right */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-slide-in ${TOAST_STYLES[toast.type] || TOAST_STYLES.info}`}
              style={{
                animation: 'slideIn 0.3s ease-out',
              }}
            >
              <span className="text-base leading-none">
                {TOAST_ICONS[toast.type]}
              </span>
              <span className="flex-1">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 opacity-70 hover:opacity-100 text-base leading-none cursor-pointer"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Inline keyframes for the slide-in animation */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
