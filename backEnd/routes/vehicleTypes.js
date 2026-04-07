import { Router } from 'express'
import * as ctrl from '../controlers/vehicleTypeController.js'
import { authorize } from '../middleware/authorize.js'

const router = Router()

router.get('/', ctrl.getAll)
router.post('/', authorize('GOD'), ctrl.create)
router.put('/:id', authorize('GOD'), ctrl.update)
router.delete('/:id', authorize('GOD'), ctrl.remove)

export default router
