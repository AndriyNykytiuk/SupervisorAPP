import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { User, Brigade, Detachment } from '../models/index.js'


function userPayload(user) {
    return {
        id: user.id,
        name: user.name,
        role: user.role,
        brigadeId: user.brigadeId,
        brigadeName: user.Brigade?.name || null,
        detachmentId: user.Brigade?.detachmentId || null,
        detachmentName: user.Brigade?.Detachment?.name || null,
    }
}

// POST /api/auth/login
export const login = async (req, res, next) => {
    try {
        const { name, password } = req.body

        // Find user with full organizational scope
        const user = await User.findOne({
            where: { name },
            include: {
                model: Brigade,
                include: [Detachment],
            },
        })

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }

        // Compare password
        const match = await bcrypt.compare(password, user.password)
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }

        // Update lastLogin for RW users (marks data as "refreshed")
        if (user.role === 'RW') {
            await user.update({ lastLogin: new Date() })
        }

        const payload = userPayload(user)

        // Generate token (includes role + scope for middleware)
        const token = jwt.sign(
            { id: payload.id, name: payload.name, role: payload.role, brigadeId: payload.brigadeId },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        )

        res.json({ user: payload, token })
    } catch (err) {
        next(err)
    }
}

// GET /api/auth/me — fresh user info from DB
export const me = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: {
                model: Brigade,
                include: [Detachment],
            },
        })

        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        res.json({ user: userPayload(user) })
    } catch (err) {
        next(err)
    }
}

// GET /api/auth/brigade-last-login/:brigadeId
// Returns the lastLogin of the RW user for the given brigade
export const getBrigadeLastLogin = async (req, res, next) => {
    try {
        const { brigadeId } = req.params

        const rwUser = await User.findOne({
            where: { brigadeId, role: 'RW' },
            order: [['lastLogin', 'DESC']],
            attributes: ['lastLogin', 'name'],
        })

        if (!rwUser) {
            return res.json({ lastLogin: null, userName: null })
        }

        res.json({ lastLogin: rwUser.lastLogin, userName: rwUser.name })
    } catch (err) {
        next(err)
    }
}

// GET /api/auth/all-brigades-activity
// Returns all brigades (scoped) and their latest RW user login
export const getAllBrigadesActivity = async (req, res, next) => {
    try {
        const whereClause = {}
        if (req.scope?.detachmentId && !req.scope?.brigadeId) {
            whereClause.detachmentId = req.scope.detachmentId
        } else if (req.scope?.brigadeId) {
            return res.status(403).json({ error: 'Forbidden' })
        }

        const brigades = await Brigade.findAll({
            where: whereClause,
            include: [
                { model: Detachment, attributes: ['name'] },
                { model: User, where: { role: 'RW' }, required: false, attributes: ['name', 'lastLogin'] }
            ],
            order: [[Detachment, 'name', 'ASC'], ['name', 'ASC']]
        })

        const result = brigades.map(b => {
             let latestUser = null
             if (b.Users && b.Users.length > 0) {
                 latestUser = b.Users.reduce((latest, user) => {
                     if (!latest || !latest.lastLogin) return user
                     if (!user.lastLogin) return latest
                     return new Date(user.lastLogin) > new Date(latest.lastLogin) ? user : latest
                 }, null)
             }
             return {
                 id: b.id,
                 name: b.name,
                 detachmentName: b.Detachment?.name,
                 rwUserName: latestUser ? latestUser.name : null,
                 lastLogin: latestUser ? latestUser.lastLogin : null
             }
        })

        res.json(result)
    } catch (err) {
        next(err)
    }
}
