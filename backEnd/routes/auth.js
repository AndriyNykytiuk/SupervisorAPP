import { Router } from 'express'
import * as ctrl from '../controlers/authController.js'
import { authenticate } from '../middleware/authenticate.js'

const router = Router()

// Public route (no token needed)
router.post('/login', ctrl.login)

// Protected route (token required)
router.get('/me', authenticate, ctrl.me)

export default router
