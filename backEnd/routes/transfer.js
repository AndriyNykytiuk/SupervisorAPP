import { Router } from 'express'
import * as ctrl from '../controlers/transferController.js'
import { authorize } from '../middleware/authorize.js'

const router = Router()

// GET — all brigades for transfer selector (no role restriction)
router.get('/brigades', ctrl.getAllBrigades)

// GET — combined test + tool items for a brigade
router.get('/brigade/:brigadeId', ctrl.getAllByBrigade)

// PUT — transfer test items + tool items to another brigade
router.put('/', authorize('GOD', 'SEMI-GOD', 'RW'), ctrl.transferItems)

export default router
