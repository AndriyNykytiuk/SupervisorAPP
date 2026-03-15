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
        where: { name: '1 ДПРЧ' },
        defaults: { name: '1 ДПРЧ', detachmentId: det1.id },
    })
    const [brig2] = await Brigade.findOrCreate({
        where: { name: '2 ДПРЧ' },
        defaults: { name: '2 ДПРЧ', detachmentId: det1.id },
    })
    const [brig3] = await Brigade.findOrCreate({
        where: { name: '3 ДПРЧ' },
        defaults: { name: '3 ДПРЧ', detachmentId: det2.id },
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
        where: { name: 'Перевірка обладнання' },
        defaults: { name: 'Перевірка обладнання' },
    })
    const [list2] = await testList.findOrCreate({
        where: { name: 'Щоденний огляд' },
        defaults: { name: 'Щоденний огляд' },
    })
    console.log('✅ Global test lists created')

    console.log('🌱 Seed completed!')
    await sequelize.close()
}

seed()
