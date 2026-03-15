import { Router } from 'express'
import * as ctrl from '../controlers/brigadeController.js'
import { authorize } from '../middleware/authorize.js'
import { scopeByRole } from '../middleware/scopeByRole.js'

const router = Router()

// GET — GOD sees all, SEMI-GOD sees their detachment's brigades, RW blocked
router.get('/', authorize('GOD', 'SEMI-GOD'), scopeByRole, ctrl.getAll)
router.get('/:id', authorize('GOD', 'SEMI-GOD'), scopeByRole, ctrl.getById)

// CUD — GOD only
router.post('/', authorize('GOD'), ctrl.create)
router.put('/:id', authorize('GOD'), ctrl.update)
router.delete('/:id', authorize('GOD'), ctrl.remove)

export default router
