import cloudinary from '../config/cloudinary.js'

/**
 * Upload a file buffer to Cloudinary.
 * @param {Buffer} fileBuffer - The image buffer from multer
 * @param {Object} options - Optional overrides (folder, etc.)
 * @returns {Promise<{ url: string, publicId: string }>}
 */
const uploadToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || 'multi-tenant-ecommerce/products',
      resource_type: 'image',
      ...options,
    }

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          })
        }
      }
    )

    stream.end(fileBuffer)
  })
}

/**
 * Delete an image from Cloudinary by public ID.
 * @param {string} publicId - The Cloudinary public ID
 * @returns {Promise<Object>}
 */
const deleteFromCloudinary = async (publicId) => {
  return cloudinary.uploader.destroy(publicId)
}

export { uploadToCloudinary, deleteFromCloudinary }
