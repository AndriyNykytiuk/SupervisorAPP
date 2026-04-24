import { Router } from 'express'
import * as ctrl from '../controlers/surveyController.js'
import { authorize } from '../middleware/authorize.js'

const router = Router()

// ── Read (all authenticated users) ──────────────────────
// RW/RO see only open surveys (filtered in controller).
router.get('/', ctrl.getAllSurveys)
router.get('/:id', ctrl.getSurveyById)

// ── Write: survey lifecycle (GOD only) ──────────────────
router.post('/', authorize('GOD'), ctrl.createSurvey)
router.put('/:id', authorize('GOD'), ctrl.updateSurvey)
router.put('/:id/close', authorize('GOD'), ctrl.closeSurvey)
router.delete('/:id', authorize('GOD'), ctrl.deleteSurvey)

// ── Responses ───────────────────────────────────────────
// Any authenticated user with a brigadeId can submit/update
// their brigade's response (enforced in controller).
router.post('/:id/responses', authorize('RW', 'SEMI-GOD', 'GOD'), ctrl.upsertResponse)

// GOD-only dashboards: per-brigade responses + aggregations
router.get('/:id/responses', authorize('GOD'), ctrl.getSurveyResponses)
router.get('/:id/aggregate', authorize('GOD'), ctrl.getSurveyAggregate)
router.get('/:id/export.csv', authorize('GOD'), ctrl.exportSurveyCsv)

export default router
