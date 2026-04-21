import { Router } from 'express'
import * as ctrl from '../controlers/garrisonToolsController.js'

const router = Router()

router.get('/', ctrl.getGarrisonTools)

export default router
