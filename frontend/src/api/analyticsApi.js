import api from './axios'

// GET /api/analytics/overview — fetch vendor analytics data
export const fetchVendorAnalytics = () => {
  return api.get('/analytics/overview')
}
