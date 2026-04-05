import { Router } from 'express'
import * as ctrl from '../controlers/equipmentAvailabilityController.js'
import { authorize } from '../middleware/authorize.js'
import { scopeByRole } from '../middleware/scopeByRole.js'

const router = Router()

router.get('/', scopeByRole, ctrl.getAll)
router.post('/', authorize('GOD', 'RW'), ctrl.create)
router.put('/:id', authorize('GOD', 'RW'), ctrl.update)
router.delete('/:id', authorize('GOD'), ctrl.remove)

export default router
