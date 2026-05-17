import { FireHydrantInspection, FireHydrant } from '../models/index.js'
import { checkBrigadeAccess, isSemiGodReadOnly } from '../utils/scopeHelpers.js'

// GET /api/fire-hydrants/:hydrantId/inspections — list inspections for a hydrant (newest first)
export const listForHydrant = async (req, res, next) => {
    try {
        const hydrant = await FireHydrant.findByPk(req.params.hydrantId)
        if (!hydrant) return res.status(404).json({ error: 'Hydrant not found' })

        const ok = await checkBrigadeAccess(req.scope, hydrant.brigadeId, res)
        if (!ok) return

        const items = await FireHydrantInspection.findAll({
            where: { fireHydrantId: hydrant.id },
            order: [['inspectionDate', 'DESC'], ['id', 'DESC']],
        })
        res.json(items)
    } catch (err) {
        next(err)
    }
}

// POST /api/fire-hydrants/:hydrantId/inspections — create new inspection + sync hydrant state
export const create = async (req, res, next) => {
    try {
        const hydrant = await FireHydrant.findByPk(req.params.hydrantId)
        if (!hydrant) return res.status(404).json({ error: 'Hydrant not found' })

        if (isSemiGodReadOnly(req.scope, res)) return

        const ok = await checkBrigadeAccess(req.scope, hydrant.brigadeId, res)
        if (!ok) return

        const inspectionDate = req.body.inspectionDate || new Date()
        const inspection = await FireHydrantInspection.create({
            fireHydrantId: hydrant.id,
            brigadeId: hydrant.brigadeId,
            inspectionDate,
            inspectorName: req.body.inspectorName || req.user?.name || null,
            inspectorUserId: req.user?.id || null,
            status: req.body.status || 'working',
            pressure: req.body.pressure || null,
            defects: req.body.defects || null,
            notes: req.body.notes || null,
            waterClean: !!req.body.waterClean,
            noWaterHammer: !!req.body.noWaterHammer,
            indicatorsPresent: !!req.body.indicatorsPresent,
            conesPresent: !!req.body.conesPresent,
            groundingOk: !!req.body.groundingOk,
        })

        // Mirror latest state onto the hydrant so list pages show current status
        await hydrant.update({
            lastInspectionDate: inspectionDate,
            nextInspectionDate: req.body.nextInspectionDate ?? hydrant.nextInspectionDate,
            status: inspection.status,
            pressure: inspection.pressure ?? hydrant.pressure,
            inspectorName: inspection.inspectorName ?? hydrant.inspectorName,
            notes: inspection.defects || inspection.notes || hydrant.notes,
            waterClean: inspection.waterClean,
            noWaterHammer: inspection.noWaterHammer,
            indicatorsPresent: inspection.indicatorsPresent,
            conesPresent: inspection.conesPresent,
            groundingOk: inspection.groundingOk,
        })

        res.status(201).json(inspection)
    } catch (err) {
        next(err)
    }
}
