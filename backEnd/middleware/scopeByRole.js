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

        if (!user || !user.Brigade) {
            return res.status(403).json({
                error: 'User is not assigned to any brigade. Contact admin.',
            })
        }

        const brigadeId = user.Brigade.id
        const detachmentId = user.Brigade.detachmentId

        if (role === 'SEMI-GOD') {
            req.scope = { detachmentId }
        } else {
            // RW (and RO if kept)
            req.scope = { brigadeId, detachmentId }
        }

        next()
    } catch (err) {
        next(err)
    }
}
