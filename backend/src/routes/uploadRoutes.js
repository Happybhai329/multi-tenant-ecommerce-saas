import express from 'express'
import multer from 'multer'
import { protect, authorize } from '../middleware/auth.js'
import { uploadImage } from '../controllers/uploadController.js'

const router = express.Router()

// Use memory storage so the file is available as a buffer (no temp files on disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB hard limit
})

// POST /api/uploads/image — authenticated vendors only
router.post(
  '/image',
  protect,
  authorize('vendor'),
  upload.single('image'),
  uploadImage
)

export default router
