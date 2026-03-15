import { Router } from 'express'
import * as ctrl from '../controlers/toolListController.js'
import { authorize } from '../middleware/authorize.js'

const router = Router()

// GET — all authenticated users
router.get('/', ctrl.getAll)
router.get('/:id', ctrl.getById)

// POST/PUT/DELETE — GOD only
router.post('/', authorize('GOD'), ctrl.create)
router.put('/:id', authorize('GOD'), ctrl.update)
router.delete('/:id', authorize('GOD'), ctrl.remove)

export default router
