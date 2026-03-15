/**
 * Role-based authorization middleware.
 *
 * Usage:  authorize('RW', 'GOD')
 *   → only users with role RW or GOD can pass through.
 *
 * Expects `req.user` to already be set by an authentication step
 * (session, JWT, etc.) with at least a `.role` property.
 */
export function authorize(...allowedRoles) {
    return (req, res, next) => {
        // If no user is attached — not authenticated at all
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' })
        }

        // Check if user's role is in the allowed list
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: insufficient permissions' })
        }

        next()
    }
}
