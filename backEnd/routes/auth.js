import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import * as ctrl from '../controlers/authController.js'
import { authenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'
import { scopeByRole } from '../middleware/scopeByRole.js'

const router = Router()

// 5 attempts per 15 minutes
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Забагато спроб входу. Зачекайте 15 хвилин.' },
    standardHeaders: true,
    legacyHeaders: false,
})

// Public route (no token needed)
router.post('/login', loginLimiter, ctrl.login)

// Protected route (token required)
router.get('/me', authenticate, ctrl.me)

// Get lastLogin of a brigade's RW user (for GOD/SEMI-GOD)
router.get('/brigade-last-login/:brigadeId', authenticate, ctrl.getBrigadeLastLogin)

// Get login activity of ALL brigades (scoped by GOD/SEMI-GOD)
router.get('/all-brigades-activity', authenticate, authorize('GOD', 'SEMI-GOD'), scopeByRole, ctrl.getAllBrigadesActivity)

export default router
