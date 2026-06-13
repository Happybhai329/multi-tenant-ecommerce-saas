import { uploadToCloudinary } from '../utils/upload.js'
import { asyncHandler } from '../middleware/errorHandler.js'

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400)
    throw new Error('No image file provided')
  }

  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
    res.status(400)
    throw new Error('Invalid file type. Allowed: JPEG, PNG, WebP, GIF')
  }

  // Validate file size
  if (req.file.size > MAX_FILE_SIZE) {
    res.status(400)
    throw new Error('File too large. Maximum size is 5MB')
  }

  const result = await uploadToCloudinary(req.file.buffer)

  res.status(200).json({
    success: true,
    data: {
      image: {
        url: result.url,
        publicId: result.publicId,
      },
    },
  })
})

export { uploadImage }
