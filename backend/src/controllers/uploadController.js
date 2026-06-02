import { uploadToCloudinary } from '../utils/upload.js'

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' })
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF',
      })
    }

    // Validate file size
    if (req.file.size > MAX_FILE_SIZE) {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB',
      })
    }

    const result = await uploadToCloudinary(req.file.buffer)

    res.status(200).json({
      success: true,
      image: {
        url: result.url,
        publicId: result.publicId,
      },
    })
  } catch (err) {
    console.error('Image upload error:', err)
    res.status(500).json({ success: false, message: 'Image upload failed' })
  }
}

export { uploadImage }
