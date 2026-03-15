import { Router } from 'express'
import * as ctrl from '../controlers/toolItemController.js'
import { authorize } from '../middleware/authorize.js'
import { scopeByRole } from '../middleware/scopeByRole.js'

const router = Router()

// GET — all roles can read (scoped by role)
router.get('/', scopeByRole, ctrl.getAll)
router.get('/brigade/:brigadeId', ctrl.getByBrigade)
router.get('/brigade/:brigadeId/tool-list/:toolListId', ctrl.getByBrigadeAndList)
router.get('/:id', scopeByRole, ctrl.getById)

// POST/PUT/DELETE — GOD + RW
router.post('/', authorize('GOD', 'RW'), scopeByRole, ctrl.create)
router.put('/transfer', authorize('GOD', 'RW'), ctrl.transfer)
router.put('/:id', authorize('GOD', 'RW'), scopeByRole, ctrl.update)
router.delete('/:id', authorize('GOD', 'RW'), scopeByRole, ctrl.remove)

export default router
