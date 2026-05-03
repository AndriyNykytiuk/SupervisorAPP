import { Router } from 'express'
import * as ctrl from '../controlers/fireExtenguisherController.js'
import { authorize } from '../middleware/authorize.js'
import { scopeByRole } from '../middleware/scopeByRole.js'

const router = Router()

router.get('/', scopeByRole, ctrl.getAll)
router.get('/upcoming', scopeByRole, ctrl.getUpcoming)
router.get('/wasted', scopeByRole, ctrl.getWasted)
router.get('/brigade/:brigadeId', ctrl.getByBrigade)
router.get('/:id', scopeByRole, ctrl.getById)

router.post('/', authorize('GOD', 'RW'), scopeByRole, ctrl.create)
router.put('/:id', authorize('GOD', 'RW'), scopeByRole, ctrl.update)
router.delete('/:id', authorize('GOD', 'RW'), scopeByRole, ctrl.remove)

export default router
