import { Op } from 'sequelize';
import sequelize from '../config/db.js';
import {
    ElectricStations,
    WaterPumps,
    HydravlicTool,
    backPackExtenguisher,
    ToolItem,
    SpecialTool,
    ChainSaw,
    PneumaticTool,
    PetrolCutter,
    LightMast,
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

        const isChainSawMatch = 'бензопили'.includes(qLower) || 'бензопила'.includes(qLower);
        const chainSaws = await ChainSaw.findAll({
            where: isChainSawMatch ? {} : {
                [Op.or]: [
                    { name: { [Op.iLike]: searchTerm } },
                    { placeOfStorage: { [Op.iLike]: searchTerm } },
                    { notes: { [Op.iLike]: searchTerm } }
                ]
            },
            include: [includeBrigade]
        });
        chainSaws.forEach(item => results.push({
            id: `cs_${item.id}`,
            name: item.name,
            type: 'Бензопили',
            characteristic: item.placeOfStorage,
            brigadeId: item.Brigade?.id,
            brigadeName: item.Brigade?.name,
            originalId: item.id
        }));

        const isPneumaticMatch = 'пневматичний інструмент'.includes(qLower) || 'пневматика'.includes(qLower);
        const pneumaticTools = await PneumaticTool.findAll({
            where: isPneumaticMatch ? {} : {
                [Op.or]: [
                    { name: { [Op.iLike]: searchTerm } },
                    { placeOfStorage: { [Op.iLike]: searchTerm } },
                    { notes: { [Op.iLike]: searchTerm } }
                ]
            },
            include: [includeBrigade]
        });
        pneumaticTools.forEach(item => results.push({
            id: `pt_${item.id}`,
            name: item.name,
            type: 'Пневматичний інструмент',
            characteristic: item.placeOfStorage,
            brigadeId: item.Brigade?.id,
            brigadeName: item.Brigade?.name,
            originalId: item.id
        }));

        const isPetrolCutterMatch = 'бензорізи'.includes(qLower) || 'бензоріз'.includes(qLower);
        const petrolCutters = await PetrolCutter.findAll({
            where: isPetrolCutterMatch ? {} : {
                [Op.or]: [
                    { name: { [Op.iLike]: searchTerm } },
                    { placeOfStorage: { [Op.iLike]: searchTerm } },
                    { notes: { [Op.iLike]: searchTerm } }
                ]
            },
            include: [includeBrigade]
        });
        petrolCutters.forEach(item => results.push({
            id: `pc_${item.id}`,
            name: item.name,
            type: 'Бензорізи',
            characteristic: item.placeOfStorage,
            brigadeId: item.Brigade?.id,
            brigadeName: item.Brigade?.name,
            originalId: item.id
        }));

        const isLightMastMatch = 'світлові мачти'.includes(qLower) || 'світлова мачта'.includes(qLower) || 'мачта'.includes(qLower) || 'мачти'.includes(qLower);
        const lightMasts = await LightMast.findAll({
            where: isLightMastMatch ? {} : {
                [Op.or]: [
                    { name: { [Op.iLike]: searchTerm } },
                    { brand: { [Op.iLike]: searchTerm } },
                    { placeOfStorage: { [Op.iLike]: searchTerm } },
                    sequelize.where(sequelize.cast(sequelize.col('power'), 'varchar'), { [Op.iLike]: searchTerm })
                ]
            },
            include: [includeBrigade]
        });
        lightMasts.forEach(item => results.push({
            id: `lm_${item.id}`,
            name: item.name,
            type: 'Світлові мачти',
            characteristic: [item.brand, item.power ? `${item.power} Вт` : null].filter(Boolean).join(' / ') || null,
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
