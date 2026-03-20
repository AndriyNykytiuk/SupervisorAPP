import { Op } from 'sequelize'
import { TestItem, testList, Brigade, FoamAgent, Powder, UsageLiquidsLog, Detachment, ElectricStations, WaterPumps, HydravlicTool } from '../models/index.js'

export const getGenericDatas = async (req, res, next) => {
    try {
        if (req.user.role === 'RW') {
            return res.status(403).json({ error: 'Access denied for RW role' })
        }

        let brigadeIds = null 
        if (req.user.role === 'SEMI-GOD') {
            const brigades = await Brigade.findAll({
                where: { detachmentId: req.scope.detachmentId },
                attributes: ['id'],
            })
            brigadeIds = brigades.map((b) => b.id)
            if (brigadeIds.length === 0) {
                 return res.json({ 
                     tests: { upcoming: [], wasted: [] }, 
                     totalLiquids: { foam: [], powder: [] }, 
                     usedLiquids: [] 
                 })
            }
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const inTenDays = new Date(today)
        inTenDays.setDate(inTenDays.getDate() + 10)
        inTenDays.setHours(23, 59, 59, 999)

        const testWhereClause = { testListId: { [Op.not]: null } }
        if (brigadeIds) testWhereClause.brigadeId = brigadeIds

        const includeBrigadeWithDetachment = [{
            model: Brigade,
            include: [Detachment]
        }]

        const wastedTests = await TestItem.findAll({
            where: { ...testWhereClause, nextTestDate: { [Op.lt]: today } },
            include: [{ model: testList }, ...includeBrigadeWithDetachment],
            order: [['nextTestDate', 'ASC']]
        })

        const upcomingTests = await TestItem.findAll({
            where: { 
                ...testWhereClause, 
                nextTestDate: { [Op.between]: [today, inTenDays] } 
            },
            include: [{ model: testList }, ...includeBrigadeWithDetachment],
            order: [['nextTestDate', 'ASC']]
        })

        const liquidWhereClause = brigadeIds ? { brigadeId: brigadeIds } : {}
        
        const foamAgents = await FoamAgent.findAll({
            where: liquidWhereClause,
            include: includeBrigadeWithDetachment
        })
        const powders = await Powder.findAll({
            where: liquidWhereClause,
            include: includeBrigadeWithDetachment
        })

        const usedLiquids = await UsageLiquidsLog.findAll({
            where: liquidWhereClause,
            include: includeBrigadeWithDetachment,
            order: [['date', 'DESC']]
        })

        const electricStations = await ElectricStations.findAll({
            where: liquidWhereClause,
            include: includeBrigadeWithDetachment
        })

        const waterPumps = await WaterPumps.findAll({
            where: liquidWhereClause,
            include: includeBrigadeWithDetachment
        })

        const hydrauliktools = await HydravlicTool.findAll({
            where: liquidWhereClause,
            include: includeBrigadeWithDetachment
        })

        let detachments = []
        if (req.user.role === 'GOD') { 
            detachments = await Detachment.findAll({
                attributes: ['id', 'name'],
                order: [['name', 'ASC']]
            })
        }

        res.json({
            tests: { wasted: wastedTests, upcoming: upcomingTests },
            totalLiquids: { foam: foamAgents, powder: powders },
            usedLiquids: usedLiquids,
            detachments: detachments,
            electricStations: electricStations,
            waterPumps: waterPumps,
            hydrauliktools: hydrauliktools
        })

    } catch (err) {
        next(err)
    }
}
