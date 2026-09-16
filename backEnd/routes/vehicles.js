import { Router } from 'express'
import * as ctrl from '../controlers/vehicleController.js'
import { authorize } from '../middleware/authorize.js'
import { scopeByRole } from '../middleware/scopeByRole.js'

const router = Router()

// Масове підтягування нормативу — перед '/:vehicleId/items', інакше
// 'items' потрапить у :vehicleId
router.post('/items/sync-standard', authorize('GOD', 'RW'), scopeByRole, ctrl.syncStandardBulk)

// Опис майна на авто
router.get('/:vehicleId/items', scopeByRole, ctrl.getItems)
router.post('/:vehicleId/items/sync-standard', authorize('GOD', 'RW'), scopeByRole, ctrl.syncStandard)
router.post('/:vehicleId/items', authorize('GOD', 'RW'), scopeByRole, ctrl.createItem)
router.put('/:vehicleId/items/:itemId', authorize('GOD', 'RW'), scopeByRole, ctrl.updateItem)
router.delete('/:vehicleId/items/:itemId', authorize('GOD', 'RW'), scopeByRole, ctrl.removeItem)

// Картки авто
router.get('/', scopeByRole, ctrl.getAll)
router.get('/:id', scopeByRole, ctrl.getById)
router.post('/', authorize('GOD', 'RW'), scopeByRole, ctrl.create)
router.put('/:id', authorize('GOD', 'RW'), scopeByRole, ctrl.update)
router.delete('/:id', authorize('GOD', 'RW'), scopeByRole, ctrl.remove)

export default router
