import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'

/**
 * Authenticate middleware — verifies the JWT token from the
 * Authorization header and attaches `req.user`.
 *
 * Header format:  Authorization: Bearer <token>
 */
export function authenticate(req, res, next) {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded // { id, name, role, iat, exp }
        next()
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' })
    }
}
