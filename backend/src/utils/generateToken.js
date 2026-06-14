import jwt from 'jsonwebtoken'
import env from '../config/env.js'

const generateToken = (user) => {
  if (!env.jwtSecret) {
    throw new Error('JWT_SECRET is not configured')
  }

  return jwt.sign(
    { id: user._id, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpire }
  )
}

export default generateToken
