import { Router } from 'express'
import * as ctrl from '../controlers/backPackExtenguisherController.js'
import { authorize } from '../middleware/authorize.js'
import { scopeByRole } from '../middleware/scopeByRole.js'

const router = Router()

// GET (Читання) — доступно всім, але фільтрується через scopeByRole
router.get('/', scopeByRole, ctrl.getAll)
router.get('/brigade/:brigadeId', ctrl.getByBrigade) // для специфічних запитів
router.get('/:id', scopeByRole, ctrl.getById)

// POST/PUT/DELETE (Запис) — дозволено тільки GOD та RW
router.post('/', authorize('GOD', 'RW'), scopeByRole, ctrl.create)
router.put('/:id', authorize('GOD', 'RW'), scopeByRole, ctrl.update)
router.delete('/:id', authorize('GOD', 'RW'), scopeByRole, ctrl.remove)

export default router
