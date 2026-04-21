import { Router } from 'express'
import * as ctrl from '../controlers/fireEventController.js'
import { authorize } from '../middleware/authorize.js'

const router = Router()

// All authenticated users can read
router.get('/', ctrl.getAllEvents)
router.get('/history', ctrl.getAllHistory)
router.get('/:id', ctrl.getEventById)
router.get('/:eventId/history', ctrl.getEventHistory)

// Only GOD can create/edit/delete events and manage teams
router.post('/', authorize('GOD'), ctrl.createEvent)
router.put('/:id', authorize('GOD'), ctrl.updateEvent)
router.put('/:id/close', authorize('GOD'), ctrl.closeEvent)
router.delete('/:id', authorize('GOD'), ctrl.deleteEvent)

router.post('/:eventId/teams', authorize('GOD'), ctrl.addTeam)
router.put('/teams/:teamId', authorize('GOD'), ctrl.updateTeam)
router.delete('/teams/:teamId', authorize('GOD'), ctrl.removeTeam)

export default router
