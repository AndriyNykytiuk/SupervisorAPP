import { Router } from 'express'
import * as ctrl from '../controlers/testLinks.js'
import { authorize } from '../middleware/authorize.js'

const router = Router()

// GET — any authenticated user can read links
router.get('/brigade/:brigadeId', ctrl.getByBrigade)

// PUT — GOD + RW can update links
router.put('/brigade/:brigadeId', authorize('GOD', 'RW'), ctrl.upsertByBrigade)

export default router
