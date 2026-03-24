import express from 'express'
import { archiveEquipment, getArchives } from '../controlers/equipmentArchiveController.js'
import { authorize } from '../middleware/authorize.js'

const router = express.Router()

// Only GOD and RW can decommission equipment
router.post('/', authorize('GOD', 'RW'), archiveEquipment)

// GOD, SEMI-GOD, and RW can view historical archives
router.get('/', authorize('GOD', 'SEMI-GOD', 'RW'), getArchives)

export default router
