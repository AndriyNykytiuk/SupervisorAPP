import { TestItem, WaterPumps, HydravlicTool, ElectricStations, SwimTools, FoamAgent, Powder, backPackExtenguisher, ToolItem, SpecialTool, EquipmentArchive, Brigade, ChainSaw, PneumaticTool, PetrolCutter, FireExtenguisher, LightMast } from '../models/index.js'
import sequelize from '../config/db.js'

const ModelMap = {
    'TestItem': TestItem,
    'WaterPumps': WaterPumps,
    'HydravlicTool': HydravlicTool,
    'ElectricStations': ElectricStations,
    'SwimTools': SwimTools,
    'FoamAgent': FoamAgent,
    'Powder': Powder,
    'backPackExtenguisher': backPackExtenguisher,
    'ToolItem': ToolItem,
    'SpecialTool': SpecialTool,
    'ChainSaw': ChainSaw,
    'PneumaticTool': PneumaticTool,
    'PetrolCutter': PetrolCutter,
    'FireExtenguisher': FireExtenguisher,
    'LightMast': LightMast,
}

// POST /api/archives
export const archiveEquipment = async (req, res) => {
    const { equipmentType, originalId, writeOffReason, writeOffExplanation, actNumber, documentLink } = req.body;

    if (!equipmentType || !originalId || !writeOffReason || !actNumber) {
        return res.status(400).json({ error: 'Missing required fields for decommissioning' })
    }

    const Model = ModelMap[equipmentType];
    if (!Model) {
        return res.status(400).json({ error: `Invalid equipmentType: ${equipmentType}` })
    }

    try {
        const item = await Model.findByPk(originalId);
        if (!item) {
            return res.status(404).json({ error: 'Item not found' })
        }

        // Scope check for RW users
        if (req.user.role === 'RW' && item.brigadeId !== req.user.brigadeId) {
            return res.status(403).json({ error: 'Forbidden: Item belongs to another brigade' })
        }

        const t = await sequelize.transaction();
        try {
            const archivePayload = {
                originalId: item.id,
                equipmentType: equipmentType,
                inventoryNumber: item.inventoryNumber || null,
                name: item.name || null,
                brigadeId: item.brigadeId,
                manufactureYear: item.manufactureYear || item.year || null,
                lastTestDate: item.testDate || item.lastTestDate || null,
                writeOffDate: new Date(),
                writeOffReason,
                writeOffExplanation,
                actNumber,
                documentLink,
                responsibleUserId: req.user.id,
                historicalData: item.toJSON()
            };

            await EquipmentArchive.create(archivePayload, { transaction: t });
            
            // Delete the original item forever
            await item.destroy({ transaction: t });

            await t.commit();
            res.status(200).json({ message: 'Equipment successfully decommissioned and archived' });
        } catch (err) {
            await t.rollback();
            throw err;
        }
    } catch (err) {
        console.error('Error in archiveEquipment:', err);
        res.status(500).json({ error: err.message });
    }
}

// GET /api/archives
export const getArchives = async (req, res) => {
    try {
        let whereClause = {};
        
        // Scope to user's brigade if RW
        if (req.user.role === 'RW') {
            whereClause.brigadeId = req.user.brigadeId;
        }
        
        const archives = await EquipmentArchive.findAll({
            where: whereClause,
            include: [{ model: Brigade, attributes: ['name'] }],
            order: [['writeOffDate', 'DESC']]
        });
        
        res.status(200).json(archives);
    } catch (err) {
        console.error('Error fetching archives:', err);
        res.status(500).json({ error: err.message });
    }
}
