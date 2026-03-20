import { Router } from 'express'
import * as ctrl from '../controlers/genericDatasController.js'
import { authorize } from '../middleware/authorize.js'

const router = Router()

router.get('/', authorize('GOD', 'SEMI-GOD'), ctrl.getGenericDatas)

export default router
