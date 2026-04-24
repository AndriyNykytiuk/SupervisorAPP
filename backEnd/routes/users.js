import { Router } from 'express'
import * as ctrl from '../controlers/userController.js'
import { authorize } from '../middleware/authorize.js'

const router = Router()

// Only GOD / SEMI-GOD can list users and fetch user details
router.get('/', authorize('GOD', 'SEMI-GOD'), ctrl.getAll)
router.get('/:id', authorize('GOD', 'SEMI-GOD'), ctrl.getById)




// Only GOD can delete and update and create
router.post('/', authorize('GOD'), ctrl.create)
router.put('/:id', authorize('GOD'), ctrl.update)
router.delete('/:id', authorize('GOD'), ctrl.remove)

export default router
