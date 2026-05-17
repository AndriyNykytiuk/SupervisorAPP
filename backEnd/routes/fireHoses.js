import { Router } from 'express'
import * as ctrl from '../controlers/fireHoseController.js'
import { authorize } from '../middleware/authorize.js'
import { scopeByRole } from '../middleware/scopeByRole.js'

const router = Router()

router.get('/', scopeByRole, ctrl.getAll)
router.get('/brigade/:brigadeId', ctrl.getByBrigade)
router.get('/:id', scopeByRole, ctrl.getById)

router.post('/', authorize('GOD', 'RW'), scopeByRole, ctrl.create)
router.put('/bulk-update', authorize('GOD', 'RW'), scopeByRole, ctrl.bulkUpdate)
router.put('/:id', authorize('GOD', 'RW'), scopeByRole, ctrl.update)
router.delete('/:id', authorize('GOD', 'RW'), scopeByRole, ctrl.remove)

export default router
