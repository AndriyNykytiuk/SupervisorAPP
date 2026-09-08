import { Router } from 'express'
import * as ctrl from '../controlers/requirementController.js'
import { scopeByRole } from '../middleware/scopeByRole.js'

const router = Router()

// Потреба ПТО — обчислюється на льоту з описів авто, у БД не зберігається
router.get('/summary', scopeByRole, ctrl.getSummary)
router.get('/', scopeByRole, ctrl.getForBrigade)

export default router
