import { useState, useEffect } from 'react'
import { fetchMyStore, updateStore } from '../../api/storeApi'
import LoadingSpinner from '../../components/LoadingSpinner'

function VendorSettingsPage() {
  const [store, setStore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [formErrors, setFormErrors] = useState({})

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    logo: '',
    banner: '',
  })

  useEffect(() => {
    const loadStore = async () => {
      try {
        const { data } = await fetchMyStore()
        setStore(data.store)
        setForm({
          name: data.store.name || '',
          description: data.store.description || '',
          logo: data.store.logo || '',
          banner: data.store.banner || '',
        })
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load store settings')
      } finally {
        setLoading(false)
      }
    }
    loadStore()
  }, [])

  const validateForm = () => {
    const errors = {}

    if (!form.name.trim()) {
      errors.name = 'Store name is required'
    } else if (form.name.trim().length > 100) {
      errors.name = 'Store name cannot exceed 100 characters'
    }

    if (form.description.length > 500) {
      errors.description = 'Description cannot exceed 500 characters'
    }

    const urlRegex = /^https?:\/\/.+/i
    if (form.logo && !urlRegex.test(form.logo)) {
      errors.logo = 'Logo must be a valid URL (http:// or https://)'
    }

    if (form.banner && !urlRegex.test(form.banner)) {
      errors.banner = 'Banner must be a valid URL (http:// or https://)'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))

    // Clear field error on edit
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { data } = await updateStore({
        name: form.name.trim(),
        description: form.description,
        logo: form.logo,
        banner: form.banner,
      })
      setStore(data.store)
      setSuccess('Store settings updated successfully!')

      setTimeout(() => setSuccess(null), 4000)
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Failed to update store'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = store && (
    form.name.trim() !== (store.name || '') ||
    form.description !== (store.description || '') ||
    form.logo !== (store.logo || '') ||
    form.banner !== (store.banner || '')
  )

  if (loading) return <LoadingSpinner />

  if (error && !store) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Store Settings</h2>
          <p className="text-gray-400 text-sm mt-1">
            Configure your store preferences
          </p>
        </div>
        <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4 text-red-300 text-sm">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Store Settings</h2>
        <p className="text-gray-400 text-sm mt-1">
          Configure your store name, description, and branding
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-lg p-4 text-emerald-300 text-sm mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && store && (
        <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4 text-red-300 text-sm mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Store Information */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Store Information
              </h3>

              <div className="space-y-5">
                {/* Store Name */}
                <div>
                  <label htmlFor="store-name" className="block text-sm font-medium text-gray-300 mb-1.5">
                    Store Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="store-name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    maxLength={100}
                    className={`w-full bg-gray-800 border rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                      formErrors.name
                        ? 'border-red-500 focus:ring-red-500/50'
                        : 'border-gray-700 focus:ring-emerald-500/50 focus:border-emerald-500'
                    }`}
                    placeholder="e.g. My Awesome Store"
                  />
                  <div className="flex justify-between mt-1.5">
                    {formErrors.name ? (
                      <span className="text-xs text-red-400">{formErrors.name}</span>
                    ) : (
                      <span />
                    )}
                    <span className="text-xs text-gray-600">{form.name.length}/100</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="store-description" className="block text-sm font-medium text-gray-300 mb-1.5">
                    Description
                  </label>
                  <textarea
                    id="store-description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    maxLength={500}
                    rows={4}
                    className={`w-full bg-gray-800 border rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 transition-all resize-none ${
                      formErrors.description
                        ? 'border-red-500 focus:ring-red-500/50'
                        : 'border-gray-700 focus:ring-emerald-500/50 focus:border-emerald-500'
                    }`}
                    placeholder="Tell customers what makes your store unique..."
                  />
                  <div className="flex justify-between mt-1.5">
                    {formErrors.description ? (
                      <span className="text-xs text-red-400">{formErrors.description}</span>
                    ) : (
                      <span />
                    )}
                    <span className="text-xs text-gray-600">{form.description.length}/500</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Branding */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Branding
              </h3>

              <div className="space-y-5">
                {/* Logo URL */}
                <div>
                  <label htmlFor="store-logo" className="block text-sm font-medium text-gray-300 mb-1.5">
                    Logo URL
                  </label>
                  <input
                    id="store-logo"
                    name="logo"
                    type="text"
                    value={form.logo}
                    onChange={handleChange}
                    className={`w-full bg-gray-800 border rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                      formErrors.logo
                        ? 'border-red-500 focus:ring-red-500/50'
                        : 'border-gray-700 focus:ring-emerald-500/50 focus:border-emerald-500'
                    }`}
                    placeholder="https://example.com/logo.png"
                  />
                  {formErrors.logo && (
                    <span className="text-xs text-red-400 mt-1.5 block">{formErrors.logo}</span>
                  )}
                  {form.logo && !formErrors.logo && (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-800 border border-gray-700 overflow-hidden flex items-center justify-center">
                        <img
                          src={form.logo}
                          alt="Logo preview"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">Logo preview</span>
                    </div>
                  )}
                </div>

                {/* Banner URL */}
                <div>
                  <label htmlFor="store-banner" className="block text-sm font-medium text-gray-300 mb-1.5">
                    Banner URL
                  </label>
                  <input
                    id="store-banner"
                    name="banner"
                    type="text"
                    value={form.banner}
                    onChange={handleChange}
                    className={`w-full bg-gray-800 border rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                      formErrors.banner
                        ? 'border-red-500 focus:ring-red-500/50'
                        : 'border-gray-700 focus:ring-emerald-500/50 focus:border-emerald-500'
                    }`}
                    placeholder="https://example.com/banner.jpg"
                  />
                  {formErrors.banner && (
                    <span className="text-xs text-red-400 mt-1.5 block">{formErrors.banner}</span>
                  )}
                  {form.banner && !formErrors.banner && (
                    <div className="mt-3">
                      <div className="w-full h-24 rounded-lg bg-gray-800 border border-gray-700 overflow-hidden">
                        <img
                          src={form.banner}
                          alt="Banner preview"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 mt-1.5 block">Banner preview</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Save Actions */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Actions</h3>
              <button
                type="submit"
                disabled={saving || !hasChanges}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                  saving || !hasChanges
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20'
                }`}
              >
                {saving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
              {!hasChanges && store && (
                <p className="text-xs text-gray-500 text-center mt-2">No changes to save</p>
              )}
            </div>

            {/* Store Info */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Store Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500 block text-xs uppercase tracking-wider font-semibold mb-0.5">Slug</span>
                  <span className="text-gray-300 font-mono text-xs">{store?.slug}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs uppercase tracking-wider font-semibold mb-0.5">Status</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${
                    store?.status === 'active'
                      ? 'bg-emerald-900/50 text-emerald-300 border-emerald-800/50'
                      : 'bg-red-900/50 text-red-300 border-red-800/50'
                  }`}>
                    {store?.status}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs uppercase tracking-wider font-semibold mb-0.5">Created</span>
                  <span className="text-gray-300">
                    {store?.createdAt && new Date(store.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                {store?.updatedAt && store.updatedAt !== store.createdAt && (
                  <div>
                    <span className="text-gray-500 block text-xs uppercase tracking-wider font-semibold mb-0.5">Last Updated</span>
                    <span className="text-gray-300">
                      {new Date(store.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Store URL */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Store URL</h3>
              <div className="bg-gray-800 rounded-lg px-3 py-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="text-xs text-gray-400 truncate font-mono">/stores/{store?.slug}</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default VendorSettingsPage
