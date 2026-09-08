// Сідер норм табельної належності (НОРМА-3, 4, 6 з наказу).
// Кожна непорожня клітинка таблиці стає позицією нормативу (EquipmentItem)
// відповідного типу техніки (VehicleType).
//
//   node backEnd/seedNorms.js               — усі норми й типи
//   node backEnd/seedNorms.js 3             — лише НОРМА-3
//   node backEnd/seedNorms.js 3:АЦ 4:АП     — точково, «норма:код»
//
// Ідемпотентний: позиції зіставляються за назвою в межах типу, тож повторний
// запуск оновлює норми, а не дублює рядки. Введену частинами наявність
// (actualQuantity в описах авто) не чіпає.

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sequelize from './config/db.js'
import { VehicleType, EquipmentItem, Vehicle, VehicleInventoryItem } from './models/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const { norms } = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/norms.json'), 'utf8'))

// Типи, заведені до появи норм у системі, — щоб не плодити дублі
const LEGACY_NAMES = {
    'Автоцистерни (АЦ)': ['Автоцистерна'],
    'Автопідіймачі (АП)': ['Автопідіймач'],
    'Спеціальна аварійно-рятувальна машина САРМ-В': ['Сарм-В', 'САРМ-В'],
}

// «1» → 1; «3****» → 3; «1х100» → 1; «До 5» → 5; «Відповідно до ТУ» → null
const parseRequired = (text) => {
    const m = String(text ?? '').match(/(\d+)/)
    return m ? Number(m[1]) : null
}

const isNumericNorm = (text) => /^\s*\d+\s*$/.test(String(text ?? ''))

const normalizeName = (s) => String(s ?? '')
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[‒–—]/g, '-')
    .replace(/[^\wа-яіїєґ']+/gi, ' ')
    .trim()
    .replace(/\s+/g, ' ')

async function seedType(norma, code) {
    const typeName = norma.typeNames[code]
    const candidates = [typeName, ...(LEGACY_NAMES[typeName] || [])]

    let type = null
    for (const name of candidates) {
        type = await VehicleType.findOne({ where: { name } })
        if (type) break
    }
    if (!type) {
        type = await VehicleType.create({ name: typeName })
    } else if (type.name !== typeName) {
        await type.update({ name: typeName })
    }

    const rows = norma.items.filter(i => i.values[code])
    const existing = await EquipmentItem.findAll({ where: { vehicleTypeId: type.id } })
    const byName = new Map(existing.map(e => [normalizeName(e.name), e]))

    let created = 0
    let updated = 0
    for (const item of rows) {
        const raw = item.values[code]
        const payload = {
            name: item.name,
            unit: item.unit || 'шт.',
            // Текст лишаємо там, де норма не є чистим числом
            required_text: isNumericNorm(raw) ? null : raw,
            required_per_vehicle: parseRequired(raw) ?? 0,
            required_rule: /відповідно до ТУ/i.test(raw) ? 'tu' : 'exact',
            vehicleTypeId: type.id,
        }
        const found = byName.get(normalizeName(item.name))
        if (found) {
            await found.update(payload)
            updated++
        } else {
            await EquipmentItem.create(payload)
            created++
        }
    }

    // Позиції, яких у нормі немає, лишаємо: частини могли внести їх понад норму
    const normNames = new Set(rows.map(r => normalizeName(r.name)))
    const extra = existing.filter(e => !normNames.has(normalizeName(e.name)))

    return { type, created, updated, extra: extra.map(e => e.name) }
}

// Прив'язує позиції описів авто до нормативу свого типу за назвою
async function linkDescriptions(typeId) {
    const norms = await EquipmentItem.findAll({ where: { vehicleTypeId: typeId } })
    const byName = new Map(norms.map(n => [normalizeName(n.name), n.id]))

    const vehicles = await Vehicle.findAll({ where: { vehicleTypeId: typeId }, attributes: ['id'] })
    if (vehicles.length === 0) return { linked: 0, orphans: 0 }

    const rows = await VehicleInventoryItem.findAll({
        where: { vehicleId: vehicles.map(v => v.id), equipmentItemId: null },
    })

    let linked = 0
    let orphans = 0
    for (const row of rows) {
        const normId = byName.get(normalizeName(row.name))
        if (normId) {
            await row.update({ equipmentItemId: normId })
            linked++
        } else {
            orphans++
        }
    }
    return { linked, orphans }
}

async function run() {
    await sequelize.authenticate()

    // Аргументи: «3» (уся норма) або «3:АЦ» (конкретний тип)
    const args = process.argv.slice(2)
    const targets = []
    for (const norma of norms) {
        for (const code of norma.codes) {
            const key = `${norma.id}:${code}`
            if (args.length === 0 || args.includes(norma.id) || args.includes(key)) {
                targets.push({ norma, code, key })
            }
        }
    }

    if (targets.length === 0) {
        console.error('Нічого не підійшло під аргументи:', args.join(', '))
        console.error('Доступні ключі:')
        for (const n of norms) console.error(`  НОРМА-${n.id}: ${n.codes.map(c => `${n.id}:${c}`).join(', ')}`)
        process.exit(1)
    }

    console.log(`Типів до заливки: ${targets.length}\n`)

    const allExtra = []
    let currentNorma = null
    for (const { norma, code } of targets) {
        if (currentNorma !== norma.id) {
            currentNorma = norma.id
            console.log(`НОРМА-${norma.id}. ${norma.title} (${norma.items.length} позицій)`)
        }
        const { type, created, updated, extra } = await seedType(norma, code)
        const { linked, orphans } = await linkDescriptions(type.id)
        console.log(
            `  ${code.padEnd(8)} ${String(type.name).slice(0, 44).padEnd(46)} ` +
            `норматив: +${created} / оновлено ${updated}` +
            (linked || orphans ? `   описи: прив'язано ${linked}, без відповідника ${orphans}` : '')
        )
        if (extra.length) allExtra.push({ type: type.name, extra })
    }

    if (allExtra.length) {
        console.log('\nПозиції в базі поза нормою (залишені без змін):')
        for (const { type, extra } of allExtra) {
            console.log(`  ${type}:`)
            extra.forEach(n => console.log(`     • ${n}`))
        }
    }

    await sequelize.close()
}

run().catch(err => {
    console.error('Помилка сідера:', err.message)
    process.exit(1)
})
