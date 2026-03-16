import 'dotenv/config'
import bcrypt from 'bcrypt'
import sequelize from './config/db.js'
import { User, Detachment, Brigade, testList, TestItem } from './models/index.js'

async function seed() {
    await sequelize.sync({ alter: true })

    const hashedPassword = await bcrypt.hash('qwerty', 10)

    // ── Create Detachments ─────────────────────
    const [det1] = await Detachment.findOrCreate({
        where: { name: '2 ДПРЗ' },
        defaults: { name: '2 ДПРЗ' },
    })
    const [det2] = await Detachment.findOrCreate({
        where: { name: '3 ДПРЗ' },
        defaults: { name: '3 ДПРЗ' },
    })

    // ── Create Brigades ────────────────────────
    const [brig1] = await Brigade.findOrCreate({
        where: { name: '22 ДПРЧ' },
        defaults: { name: '22 ДПРЧ', detachmentId: det1.id },
    })
    const [brig2] = await Brigade.findOrCreate({
        where: { name: '23 ДПРЧ' },
        defaults: { name: '23 ДПРЧ', detachmentId: det1.id },
    })
    const [brig3] = await Brigade.findOrCreate({
        where: { name: '1 ДПРЧ' },
        defaults: { name: '1 ДПРЧ', detachmentId: det2.id },
    })

    // ── Create Users ───────────────────────────
    // GOD user — no brigade
    const [godUser, godCreated] = await User.findOrCreate({
        where: { name: 'afryca' },
        defaults: {
            name: 'afryca',
            password: hashedPassword,
            role: 'GOD',
            brigadeId: null,
        },
    })
    console.log(godCreated ? '✅ GOD user "afryca" created' : 'ℹ️  GOD user "afryca" already exists')

    // ── Create global test lists (shared by all brigades) ──
    const [list1] = await testList.findOrCreate({
        where: { name: 'Драбина висувна триколінна' },
        defaults: { name: 'Драбина висувна триколінна' },
    })
    const [list2] = await testList.findOrCreate({
        where: { name: 'Драбина штурмова' },
        defaults: { name: 'Драбина штурмова' },
    })
    const [list3] = await testList.findOrCreate({
        where: { name: 'Драбина палиця' },
        defaults: { name: 'Драбина палиця' },
    })
    const [list4] = await testList.findOrCreate({
        where: { name: 'Драбина європейського взірця' },
        defaults: { name: 'Драбина європейського взірця' },
    })
    const [list5] = await testList.findOrCreate({
        where: { name: 'Рукавні Затримки' },
        defaults: { name: 'Рукавні Затримки' },
    })
    const [list6] = await testList.findOrCreate({
        where: { name: 'Рятувальні пояси' },
        defaults: { name: 'Рятувальні пояси' },
    })
    const [list7] = await testList.findOrCreate({
        where: { name: 'Рятувальні карабіни' },
        defaults: { name: 'Рятувальні карабіни' },
    })
    const [list8] = await testList.findOrCreate({
        where: { name: 'Рукавиці гумові діелектричні' },
        defaults: { name: 'Рукавиці гумові діелектричні' },
    })
    const [list9] = await testList.findOrCreate({
        where: { name: 'Боти діелектричні' },
        defaults: { name: 'Боти діелектричні' },
    })
    const [list10] = await testList.findOrCreate({
        where: { name: 'Ізолюючі діелектричні ножиці' },
        defaults: { name: 'Ізолюючі діелектричні ножиці' },
    })
    const [list11] = await testList.findOrCreate({
        where: { name: 'Пристосування для обрізки проводів ( штанга кусака з ізолюючим канатом)' },
        defaults: { name: 'Пристосування для обрізки проводів ( штанга кусака з ізолюючим канатом)' },
    })
    const [list12] = await testList.findOrCreate({
        where: { name: 'Мотузка рятувальна' },
        defaults: { name: 'Мотузка рятувальна' },
    })
    const [list13] = await testList.findOrCreate({
        where: { name: 'Тельфер для підйому пожежних рукавів' },
        defaults: { name: 'Тельфер для підйому пожежних рукавів' },
    })
    const [list14] = await testList.findOrCreate({
        where: { name: 'Пристрій для страхування' },
        defaults: { name: 'Пристрій для страхування' },
    })
    const [list15] = await testList.findOrCreate({
        where: { name: 'Оновлення запобіжної подушки' },
        defaults: { name: 'Оновлення запобіжної подушки' },
    })
    const [list16] = await testList.findOrCreate({
        where: { name: 'Манометри' },
        defaults: { name: 'Манометри' },
    })
    const [list17] = await testList.findOrCreate({
        where: { name: 'Динамометри' },
        defaults: { name: 'Динамометри' },
    })
    const [list18] = await testList.findOrCreate({
        where: { name: 'Верхолазне спорядження' },
        defaults: { name: 'Верхолазне спорядження' },
    })
    console.log('✅ Global test lists created')

    console.log('🌱 Seed completed!')
    await sequelize.close()
}

seed()
