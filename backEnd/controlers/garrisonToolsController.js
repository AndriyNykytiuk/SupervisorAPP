import {
    ElectricStations,
    WaterPumps,
    HydravlicTool,
    SwimTools,
    backPackExtenguisher,
    SpecialTool,
    ToolItem,
    toolList,
    Brigade,
} from '../models/index.js'

// Returns ALL tools across the entire garrison, grouped by category.
// Used by the fire-event "add team" modal to let GOD pick equipment.
export const getGarrisonTools = async (req, res, next) => {
    try {
        const brigadeInclude = { model: Brigade, attributes: ['id', 'name'] }

        const [electric, pumps, hydraulic, swim, backpack, special, toolItems] =
            await Promise.all([
                ElectricStations.findAll({ include: [brigadeInclude] }),
                WaterPumps.findAll({ include: [brigadeInclude] }),
                HydravlicTool.findAll({ include: [brigadeInclude] }),
                SwimTools.findAll({ include: [brigadeInclude] }),
                backPackExtenguisher.findAll({ include: [brigadeInclude] }),
                SpecialTool.findAll({ include: [brigadeInclude] }),
                ToolItem.findAll({
                    include: [brigadeInclude, { model: toolList, attributes: ['id', 'name'] }],
                }),
            ])

        const pack = (items, prefix, category, charPicker) =>
            items.map((it) => ({
                id: `${prefix}_${it.id}`,
                originalId: it.id,
                category,
                name: it.name,
                characteristic: charPicker(it),
                brigadeId: it.Brigade?.id,
                brigadeName: it.Brigade?.name,
            }))

        const groups = [
            {
                category: 'Електростанції',
                items: pack(electric, 'es', 'Електростанції', (i) => i.powerOf),
            },
            {
                category: 'Мотопомпи',
                items: pack(pumps, 'wp', 'Мотопомпи', (i) => i.powerOf),
            },
            {
                category: 'Гідравлічний інструмент',
                items: pack(hydraulic, 'ht', 'Гідравлічний інструмент', (i) => i.typeOfStern),
            },
            {
                category: 'Плаваючий засіб',
                items: pack(swim, 'sw', 'Плаваючий засіб', (i) => i.powerOf || null),
            },
            {
                category: 'Ранцеві вогнегасники',
                items: pack(backpack, 'bp', 'Ранцеві вогнегасники', (i) => i.volumeOfWater),
            },
            {
                category: 'Спеціальне обладнання',
                items: pack(special, 'st', 'Спеціальне обладнання', (i) => i.quantity),
            },
        ]

        // Group generic ToolItems by their toolList name
        const byList = new Map()
        toolItems.forEach((it) => {
            const listName = it.toolList?.name || 'Інше обладнання'
            if (!byList.has(listName)) byList.set(listName, [])
            byList.get(listName).push({
                id: `ti_${it.id}`,
                originalId: it.id,
                category: listName,
                name: it.name,
                characteristic: it.powerfull,
                brigadeId: it.Brigade?.id,
                brigadeName: it.Brigade?.name,
            })
        })
        byList.forEach((items, category) => {
            groups.push({ category, items })
        })

        // Drop empty groups, sort items by brigade then name
        const result = groups
            .filter((g) => g.items.length > 0)
            .map((g) => ({
                category: g.category,
                items: g.items.sort((a, b) => {
                    const bn = (a.brigadeName || '').localeCompare(b.brigadeName || '')
                    if (bn !== 0) return bn
                    return (a.name || '').localeCompare(b.name || '')
                }),
            }))

        res.json(result)
    } catch (err) {
        next(err)
    }
}
