import { Router } from 'express'
import * as ctrl from '../controlers/genericDatasController.js'
import { authorize } from '../middleware/authorize.js'
import { scopeByRole } from '../middleware/scopeByRole.js'

const router = Router()

router.get('/', authorize('GOD', 'SEMI-GOD'), scopeByRole, ctrl.getGenericDatas)

export default router
