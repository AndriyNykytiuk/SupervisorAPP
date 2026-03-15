import { Router } from 'express'
import * as ctrl from '../controlers/productController.js'
import { authorize } from '../middleware/authorize.js'

const router = Router()

// Anyone authenticated can read
router.get('/', ctrl.getAll)
router.get('/:id', ctrl.getById)

// RW, SEMI-GOD, GOD can create & update
router.post('/', authorize('RW', 'SEMI-GOD', 'GOD'), ctrl.create)
router.put('/:id', authorize('RW', 'SEMI-GOD', 'GOD'), ctrl.update)

// Only GOD can delete
router.delete('/:id', authorize('GOD'), ctrl.remove)

export default router
