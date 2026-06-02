import api from './axios'

/**
 * Upload a product image to Cloudinary via the backend.
 * @param {File} file - The image file to upload
 * @param {Function} onProgress - Callback receiving progress percentage (0-100)
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export const uploadProductImage = async (file, onProgress) => {
  const formData = new FormData()
  formData.append('image', file)

  const response = await api.post('/uploads/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percent)
      }
    },
  })

  return response.data.image
}
