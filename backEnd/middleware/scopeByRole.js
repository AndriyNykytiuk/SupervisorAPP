import { User, Brigade } from '../models/index.js'


export async function scopeByRole(req, res, next) {
    try {
        const { role, id } = req.user

        // GOD sees everything
        if (role === 'GOD') {
            req.scope = null
            return next()
        }

        // Load the full user record with their brigade (which has a detachmentId)
        const user = await User.findByPk(id, {
            include: {
                model: Brigade,
                attributes: ['id', 'detachmentId'],
            },
        })

        if (!user) {
            return res.status(403).json({ error: 'User not found. Contact admin.' })
        }

        // SEMI-GOD: prefer direct user.detachmentId; fall back to brigade's detachmentId
        // for legacy users that were anchored via a brigade.
        if (role === 'SEMI-GOD') {
            const detachmentId = user.detachmentId ?? user.Brigade?.detachmentId
            if (!detachmentId) {
                return res.status(403).json({
                    error: 'SEMI-GOD user is not assigned to any detachment. Contact admin.',
                })
            }
            req.scope = { detachmentId }
            return next()
        }

        // RW (and RO if kept) — must have a brigade
        if (!user.Brigade) {
            return res.status(403).json({
                error: 'User is not assigned to any brigade. Contact admin.',
            })
        }

        req.scope = {
            brigadeId: user.Brigade.id,
            detachmentId: user.Brigade.detachmentId,
        }

        next()
    } catch (err) {
        next(err)
    }
}
