import { TestItem, testList, ToolItem, toolList, Brigade, Detachment, ElectricStations, HydravlicTool, SwimTools, TransferLog } from '../models/index.js'
import { Op } from 'sequelize'

// GET /api/transfer/brigades — all detachments with brigades (no role restriction)
export const getAllBrigades = async (req, res, next) => {
    try {
        const detachments = await Detachment.findAll({ include: Brigade })
        res.json(detachments)
    } catch (err) {
        next(err)
    }
}

// GET /api/transfer/brigade/:brigadeId — combined test items + tool items grouped by lists
export const getAllByBrigade = async (req, res, next) => {
    try {
        const brigadeId = req.params.brigadeId

        // Fetch test items grouped by testList
        const testLists = await testList.findAll({
            include: {
                model: TestItem,
                where: { brigadeId },
                required: false,
            },
        })

        // Fetch tool items grouped by toolList
        const toolLists = await toolList.findAll({
            include: {
                model: ToolItem,
                where: { brigadeId },
                required: false,
            },
        })

        // Fetch Electric Stations
        const electricStations = await ElectricStations.findAll({
            where: { brigadeId }
        })

        // Fetch Hydravlic Tools
        const hydravlicTools = await HydravlicTool.findAll({
            where: { brigadeId }
        })

        // Fetch Swim Tools
        const swimTools = await SwimTools.findAll({
            where: { brigadeId }
        })

        res.json({
            brigadeId: parseInt(brigadeId),
            testLists,
            toolLists,
            electricStations,
            hydravlicTools,
            swimTools,
        })
    } catch (err) {
        next(err)
    }
}

// PUT /api/transfer — move test items + tool items to another brigade
export const transferItems = async (req, res, next) => {
    try {
        const { testItemIds, toolItemIds, electricStationIds, hydravlicToolIds, swimToolTransfers, toBrigadeId } = req.body

        if (!toBrigadeId) {
            return res.status(400).json({ error: 'toBrigadeId is required' })
        }

        const targetBrigade = await Brigade.findByPk(toBrigadeId)
        if (!targetBrigade) {
            return res.status(404).json({ error: 'Target brigade not found' })
        }

        const result = { testItems: [], toolItems: [], electricStations: [] }

        // Transfer test items
        if (testItemIds && testItemIds.length > 0) {
            const items = await TestItem.findAll({ where: { id: testItemIds }, include: [Brigade] })
            for (const item of items) {
                await TransferLog.create({
                    itemName: item.name || `TestItem #${item.id}`,
                    equipmentType: 'TestItem',
                    fromBrigadeId: item.brigadeId,
                    toBrigadeId,
                    quantity: 1,
                    details: item.toJSON(),
                })
            }
            await TestItem.update({ brigadeId: toBrigadeId }, { where: { id: testItemIds } })
            result.testItems = await TestItem.findAll({
                where: { id: testItemIds },
                include: [testList, Brigade],
            })
        }

        // Transfer tool items
        if (toolItemIds && toolItemIds.length > 0) {
            const items = await ToolItem.findAll({ where: { id: toolItemIds }, include: [Brigade] })
            for (const item of items) {
                await TransferLog.create({
                    itemName: item.name || `ToolItem #${item.id}`,
                    equipmentType: 'ToolItem',
                    fromBrigadeId: item.brigadeId,
                    toBrigadeId,
                    quantity: 1,
                    details: item.toJSON(),
                })
            }
            await ToolItem.update({ brigadeId: toBrigadeId }, { where: { id: toolItemIds } })
            result.toolItems = await ToolItem.findAll({
                where: { id: toolItemIds },
                include: [toolList, Brigade],
            })
        }

        // Transfer electric stations
        if (electricStationIds && electricStationIds.length > 0) {
            const items = await ElectricStations.findAll({ where: { id: electricStationIds }, include: [Brigade] })
            for (const item of items) {
                await TransferLog.create({
                    itemName: item.name || `ElectricStation #${item.id}`,
                    equipmentType: 'ElectricStations',
                    fromBrigadeId: item.brigadeId,
                    toBrigadeId,
                    quantity: 1,
                    details: item.toJSON(),
                })
            }
            await ElectricStations.update({ brigadeId: toBrigadeId }, { where: { id: electricStationIds } })
            result.electricStations = await ElectricStations.findAll({
                where: { id: electricStationIds },
                include: [Brigade],
            })
        }

        // Transfer hydravlic tools
        if (hydravlicToolIds && hydravlicToolIds.length > 0) {
            const items = await HydravlicTool.findAll({ where: { id: hydravlicToolIds }, include: [Brigade] })
            for (const item of items) {
                await TransferLog.create({
                    itemName: item.name || `HydravlicTool #${item.id}`,
                    equipmentType: 'HydravlicTool',
                    fromBrigadeId: item.brigadeId,
                    toBrigadeId,
                    quantity: 1,
                    details: item.toJSON(),
                })
            }
            await HydravlicTool.update({ brigadeId: toBrigadeId }, { where: { id: hydravlicToolIds } })
            result.hydravlicTools = await HydravlicTool.findAll({
                where: { id: hydravlicToolIds },
                include: [Brigade],
            })
        }

        // Transfer swim tools line-by-line quantities
        if (swimToolTransfers && swimToolTransfers.length > 0) {
            result.swimTools = []
            for (const transfer of swimToolTransfers) {
                const { id, transferData } = transfer
                const originalRecord = await SwimTools.findByPk(id)

                if (originalRecord) {
                    // Log the swim tools transfer
                    const totalQty = Object.values(transferData).reduce((sum, v) => sum + (v || 0), 0)
                    if (totalQty > 0) {
                        await TransferLog.create({
                            itemName: 'Засоби порятунку на воді',
                            equipmentType: 'SwimTools',
                            fromBrigadeId: originalRecord.brigadeId,
                            toBrigadeId,
                            quantity: totalQty,
                            details: transferData,
                        })
                    }

                    // Deduct from original
                    originalRecord.lifeBoat = Math.max(0, (originalRecord.lifeBoat || 0) - (transferData.lifeBoat || 0))
                    originalRecord.motorLifeBoat = Math.max(0, (originalRecord.motorLifeBoat || 0) - (transferData.motorLifeBoat || 0))
                    originalRecord.lifeBouy = Math.max(0, (originalRecord.lifeBouy || 0) - (transferData.lifeBouy || 0))
                    originalRecord.lifeRoup = Math.max(0, (originalRecord.lifeRoup || 0) - (transferData.lifeRoup || 0))
                    originalRecord.lifePath = Math.max(0, (originalRecord.lifePath || 0) - (transferData.lifePath || 0))
                    originalRecord.rescueSlad = Math.max(0, (originalRecord.rescueSlad || 0) - (transferData.rescueSlad || 0))
                    originalRecord.lifeJacket = Math.max(0, (originalRecord.lifeJacket || 0) - (transferData.lifeJacket || 0))
                    originalRecord.drySuits = Math.max(0, (originalRecord.drySuits || 0) - (transferData.drySuits || 0))

                    await originalRecord.save()

                    // Destroy original record if totally empty now
                    if (originalRecord.lifeBoat === 0 && originalRecord.motorLifeBoat === 0 && originalRecord.lifeBouy === 0 &&
                        originalRecord.lifeRoup === 0 && originalRecord.lifePath === 0 && originalRecord.rescueSlad === 0 &&
                        originalRecord.lifeJacket === 0 && originalRecord.drySuits === 0) {
                        await originalRecord.destroy()
                    }

                    const existingTargetRecord = await SwimTools.findOne({ where: { brigadeId: toBrigadeId } })

                    if (existingTargetRecord) {
                        existingTargetRecord.lifeBoat = (existingTargetRecord.lifeBoat || 0) + (transferData.lifeBoat || 0)
                        existingTargetRecord.motorLifeBoat = (existingTargetRecord.motorLifeBoat || 0) + (transferData.motorLifeBoat || 0)
                        existingTargetRecord.lifeBouy = (existingTargetRecord.lifeBouy || 0) + (transferData.lifeBouy || 0)
                        existingTargetRecord.lifeRoup = (existingTargetRecord.lifeRoup || 0) + (transferData.lifeRoup || 0)
                        existingTargetRecord.lifePath = (existingTargetRecord.lifePath || 0) + (transferData.lifePath || 0)
                        existingTargetRecord.rescueSlad = (existingTargetRecord.rescueSlad || 0) + (transferData.rescueSlad || 0)
                        existingTargetRecord.lifeJacket = (existingTargetRecord.lifeJacket || 0) + (transferData.lifeJacket || 0)
                        existingTargetRecord.drySuits = (existingTargetRecord.drySuits || 0) + (transferData.drySuits || 0)
                        await existingTargetRecord.save()
                        result.swimTools.push(existingTargetRecord)
                    } else {
                        const newRecord = await SwimTools.create({
                            brigadeId: toBrigadeId,
                            lifeBoat: transferData.lifeBoat || 0,
                            motorLifeBoat: transferData.motorLifeBoat || 0,
                            lifeBouy: transferData.lifeBouy || 0,
                            lifeRoup: transferData.lifeRoup || 0,
                            lifePath: transferData.lifePath || 0,
                            rescueSlad: transferData.rescueSlad || 0,
                            lifeJacket: transferData.lifeJacket || 0,
                            drySuits: transferData.drySuits || 0
                        })
                        result.swimTools.push(newRecord)
                    }
                }
            }
        }

        res.json(result)
    } catch (err) {
        next(err)
    }
}

// GET /api/transfer/logs — fetch all transfer logs
export const getTransferLogs = async (req, res, next) => {
    try {
        const whereClause = {}

        // Optional date range filtering
        if (req.query.from || req.query.to) {
            whereClause.transferDate = {}
            if (req.query.from) whereClause.transferDate[Op.gte] = new Date(req.query.from)
            if (req.query.to) {
                const toDate = new Date(req.query.to)
                toDate.setHours(23, 59, 59, 999)
                whereClause.transferDate[Op.lte] = toDate
            }
        }

        // Optional brigade filtering
        if (req.query.brigadeId) {
            whereClause[Op.or] = [
                { fromBrigadeId: req.query.brigadeId },
                { toBrigadeId: req.query.brigadeId },
            ]
        }

        const logs = await TransferLog.findAll({
            where: whereClause,
            include: [
                { model: Brigade, as: 'FromBrigade', attributes: ['name'] },
                { model: Brigade, as: 'ToBrigade', attributes: ['name'] },
            ],
            order: [['transferDate', 'DESC']],
        })
        res.json(logs)
    } catch (err) {
        next(err)
    }
}
