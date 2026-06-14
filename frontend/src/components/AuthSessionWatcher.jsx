import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { sessionExpired } from '../features/auth/authSlice'
import { useToast } from './ToastContext'

function AuthSessionWatcher() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()

  useEffect(() => {
    const handleSessionExpired = (event) => {
      const message = event.detail?.message || 'Your session has expired. Please sign in again.'

      dispatch(sessionExpired(message))
      showToast(message, 'error')

      if (!location.pathname.startsWith('/login')) {
        navigate('/login', {
          replace: true,
          state: { from: location },
        })
      }
    }

    window.addEventListener('auth:session-expired', handleSessionExpired)
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired)
  }, [dispatch, location, navigate, showToast])

  return null
}

export default AuthSessionWatcher
