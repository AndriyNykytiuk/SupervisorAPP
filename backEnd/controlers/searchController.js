import { Op } from 'sequelize';
import sequelize from '../config/db.js';
import { 
    ElectricStations, 
    WaterPumps, 
    HydravlicTool, 
    backPackExtenguisher, 
    ToolItem, 
    SpecialTool,
    Brigade 
} from '../models/index.js';

export const searchAllTools = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const qLower = q.toLowerCase();
        const searchTerm = `%${q}%`;
        const results = [];

        const includeBrigade = {
            model: Brigade,
            attributes: ['id', 'name']
        };

        const isElectricMatch = 'електростанції'.includes(qLower) || 'генератор'.includes(qLower);
        const electricStations = await ElectricStations.findAll({
            where: isElectricMatch ? {} : {
                [Op.or]: [
                    { name: { [Op.iLike]: searchTerm } },
                    sequelize.where(sequelize.cast(sequelize.col('powerOf'), 'varchar'), { [Op.iLike]: searchTerm })
                ]
            },
            include: [includeBrigade]
        });
        electricStations.forEach(item => results.push({
            id: `es_${item.id}`,
            name: item.name,
            type: 'Електростанції',
            characteristic: item.powerOf,
            brigadeId: item.Brigade?.id,
            brigadeName: item.Brigade?.name,
            originalId: item.id
        }));

        const isPumpMatch = 'мотопомпи'.includes(qLower) || 'помпа'.includes(qLower);
        const waterPumps = await WaterPumps.findAll({
            where: isPumpMatch ? {} : {
                [Op.or]: [
                    { name: { [Op.iLike]: searchTerm } },
                    sequelize.where(sequelize.cast(sequelize.col('powerOf'), 'varchar'), { [Op.iLike]: searchTerm })
                ]
            },
            include: [includeBrigade]
        });
        waterPumps.forEach(item => results.push({
            id: `wp_${item.id}`,
            name: item.name,
            type: 'Мотопомпи',
            characteristic: item.powerOf,
            brigadeId: item.Brigade?.id,
            brigadeName: item.Brigade?.name,
            originalId: item.id
        }));

        const isHydraulicMatch = 'гідравлічний інструмент'.includes(qLower) || 'гідравліка'.includes(qLower);
        const hydravlicTools = await HydravlicTool.findAll({
            where: isHydraulicMatch ? {} : {
                [Op.or]: [
                    { name: { [Op.iLike]: searchTerm } },
                    { typeOfStern: { [Op.iLike]: searchTerm } }
                ]
            },
            include: [includeBrigade]
        });
        hydravlicTools.forEach(item => results.push({
            id: `ht_${item.id}`,
            name: item.name,
            type: 'Гідравлічний інструмент',
            characteristic: item.typeOfStern,
            brigadeId: item.Brigade?.id,
            brigadeName: item.Brigade?.name,
            originalId: item.id
        }));

        const isBackpackMatch = 'ранцеві вогнегасники'.includes(qLower) || 'ранець'.includes(qLower);
        const backPacks = await backPackExtenguisher.findAll({
            where: isBackpackMatch ? {} : {
                [Op.or]: [
                    { name: { [Op.iLike]: searchTerm } },
                    sequelize.where(sequelize.cast(sequelize.col('volumeOfWater'), 'varchar'), { [Op.iLike]: searchTerm })
                ]
            },
            include: [includeBrigade]
        });
        backPacks.forEach(item => results.push({
            id: `bp_${item.id}`,
            name: item.name,
            type: 'Ранцеві вогнегасники',
            characteristic: item.volumeOfWater,
            brigadeId: item.Brigade?.id,
            brigadeName: item.Brigade?.name,
            originalId: item.id
        }));

        const isPtoMatch = 'пто'.includes(qLower) || 'інше обладнання'.includes(qLower) || 'загальне'.includes(qLower);
        const toolItems = await ToolItem.findAll({
            where: isPtoMatch ? {} : {
                [Op.or]: [
                    { name: { [Op.iLike]: searchTerm } },
                    sequelize.where(sequelize.cast(sequelize.col('powerfull'), 'varchar'), { [Op.iLike]: searchTerm })
                ]
            },
            include: [includeBrigade]
        });
        toolItems.forEach(item => results.push({
            id: `ti_${item.id}`,
            name: item.name,
            type: 'ПТО (Загальне)',
            characteristic: item.powerfull,
            brigadeId: item.Brigade?.id,
            brigadeName: item.Brigade?.name,
            originalId: item.id
        }));

        const isSpecialMatch = 'спеціальне обладнання'.includes(qLower) || 'спеціальн'.includes(qLower);
        const specialTools = await SpecialTool.findAll({
            where: isSpecialMatch ? {} : {
                [Op.or]: [
                    { name: { [Op.iLike]: searchTerm } },
                    sequelize.where(sequelize.cast(sequelize.col('quantity'), 'varchar'), { [Op.iLike]: searchTerm })
                ]
            },
            include: [includeBrigade]
        });
        specialTools.forEach(item => results.push({
            id: `st_${item.id}`,
            name: item.name,
            type: 'Спеціальне обладнання',
            characteristic: item.quantity,
            brigadeId: item.Brigade?.id,
            brigadeName: item.Brigade?.name,
            originalId: item.id
        }));

        res.json(results);
    } catch (error) {
        console.error('Failed to search tools:', error);
        res.status(500).json({ error: 'Помилка при пошуку обладнання' });
    }
};
