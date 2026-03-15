import { Router } from 'express'
import * as ctrl from '../controlers/testItemController.js'
import { authorize } from '../middleware/authorize.js'
import { scopeByRole } from '../middleware/scopeByRole.js'

const router = Router()

// GET — all roles can read (scoped by role)
router.get('/', scopeByRole, ctrl.getAll)
router.get('/upcoming', scopeByRole, ctrl.getUpcoming)
router.get('/wasted', scopeByRole, ctrl.getWasted)
router.get('/brigade/:brigadeId', ctrl.getByBrigade)
router.get('/brigade/:brigadeId/test-list/:testListId', ctrl.getByBrigadeAndList)
router.get('/:id', scopeByRole, ctrl.getById)

// POST/PUT/DELETE — GOD + RW (SEMI-GOD blocked inside controller)
router.post('/', authorize('GOD', 'RW'), scopeByRole, ctrl.create)
router.put('/transfer', authorize('GOD', 'RW'), ctrl.transfer)
router.put('/:id', authorize('GOD', 'RW'), scopeByRole, ctrl.update)
router.delete('/:id', authorize('GOD', 'RW'), scopeByRole, ctrl.remove)

export default router
