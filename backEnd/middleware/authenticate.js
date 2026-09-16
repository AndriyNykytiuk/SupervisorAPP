import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'

// Write Users.lastSeen at most once per interval per user, so every request doesn't hit the DB
const LAST_SEEN_INTERVAL_MS = 5 * 60 * 1000
const lastSeenWrites = new Map()

function touchLastSeen(userId) {
    if (!userId) return
    const now = Date.now()
    if (now - (lastSeenWrites.get(userId) || 0) < LAST_SEEN_INTERVAL_MS) return
    lastSeenWrites.set(userId, now)
    User.update({ lastSeen: new Date(now) }, { where: { id: userId } })
        .catch((err) => console.error('lastSeen update failed:', err.message))
}

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
        touchLastSeen(decoded.id)
        next()
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' })
    }
}
