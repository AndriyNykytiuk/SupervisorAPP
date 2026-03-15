import { TestLinks, Brigade } from '../models/index.js'

// GET /api/test-links/brigade/:brigadeId — get links for a brigade
export const getByBrigade = async (req, res, next) => {
    try {
        let links = await TestLinks.findOne({
            where: { brigadeId: req.params.brigadeId },
            include: Brigade,
        })

        // If no links exist for this brigade, return empty object
        if (!links) {
            return res.json({ brigadeId: parseInt(req.params.brigadeId), linkSchedule: null, linkOrder: null })
        }

        res.json(links)
    } catch (err) {
        next(err)
    }
}

// PUT /api/test-links/brigade/:brigadeId — create or update links for a brigade
export const upsertByBrigade = async (req, res, next) => {
    try {
        const { linkSchedule, linkOrder } = req.body
        const brigadeId = req.params.brigadeId

        // Verify brigade exists
        const brigade = await Brigade.findByPk(brigadeId)
        if (!brigade) {
            return res.status(404).json({ error: 'Brigade not found' })
        }

        // Find existing or create
        let links = await TestLinks.findOne({ where: { brigadeId } })

        if (links) {
            await links.update({ linkSchedule, linkOrder })
        } else {
            links = await TestLinks.create({ brigadeId, linkSchedule, linkOrder })
        }

        res.json(links)
    } catch (err) {
        next(err)
    }
}