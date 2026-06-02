import { useState, useRef } from 'react'
import { uploadProductImage } from '../../api/uploadApi'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_IMAGES = 5

function ImageUploader({ images = [], onChange }) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset file input so the same file can be re-selected
    e.target.value = ''

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Invalid file type. Allowed: JPEG, PNG, WebP, GIF')
      return
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File too large. Maximum size is 5MB')
      return
    }

    // Check max count
    if (images.length >= MAX_IMAGES) {
      setUploadError(`Maximum ${MAX_IMAGES} images allowed`)
      return
    }

    setUploadError(null)
    setUploading(true)
    setUploadProgress(0)

    try {
      const result = await uploadProductImage(file, (percent) => {
        setUploadProgress(percent)
      })

      const newImage = {
        url: result.url,
        publicId: result.publicId,
        isPrimary: images.length === 0, // First image is automatically primary
      }

      onChange([...images, newImage])
    } catch (err) {
      setUploadError(
        err.response?.data?.message || 'Upload failed. Please try again.'
      )
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleRemoveImage = (index) => {
    const updated = images.filter((_, i) => i !== index)

    // If we removed the primary image, make the first remaining image primary
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
      updated[0].isPrimary = true
    }

    onChange(updated)
  }

  const handleSetPrimary = (index) => {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }))
    onChange(updated)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        Product Images
        <span className="text-gray-500 font-normal ml-1">
          ({images.length}/{MAX_IMAGES})
        </span>
      </label>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          {images.map((image, index) => (
            <div
              key={image.publicId || index}
              className={`relative group rounded-lg overflow-hidden border-2 transition-colors ${
                image.isPrimary
                  ? 'border-emerald-500'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              {/* Image */}
              <div className="aspect-square bg-gray-800">
                <img
                  src={image.url}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Primary Badge */}
              {image.isPrimary && (
                <span className="absolute top-1.5 left-1.5 text-xs bg-emerald-600 text-white px-1.5 py-0.5 rounded font-medium">
                  Primary
                </span>
              )}

              {/* Hover Overlay with Actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {/* Set as Primary */}
                {!image.isPrimary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(index)}
                    className="p-1.5 bg-gray-800/80 hover:bg-emerald-600 text-white rounded-lg transition-colors cursor-pointer"
                    title="Set as primary image"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                )}

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="p-1.5 bg-gray-800/80 hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer"
                  title="Remove image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="mb-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 w-10 text-right">
              {uploadProgress}%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Uploading image...</p>
        </div>
      )}

      {/* Upload Error */}
      {uploadError && (
        <div className="mb-3 flex items-center justify-between bg-red-900/20 border border-red-800/40 text-red-400 text-xs px-3 py-2 rounded-lg">
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-red-400 hover:text-red-300 ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Upload Button */}
      {images.length < MAX_IMAGES && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full py-3 border-2 border-dashed border-gray-700 hover:border-gray-600 rounded-lg text-sm text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </>
      )}

      {/* Help text */}
      <p className="text-xs text-gray-600 mt-1.5">
        JPEG, PNG, WebP, or GIF. Max 5MB each.
        {images.length > 1 && ' Click the star to set primary image.'}
      </p>
    </div>
  )
}

export default ImageUploader
