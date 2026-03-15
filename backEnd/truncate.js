import 'dotenv/config'
import sequelize from './config/db.js'

async function truncateAll() {
    await sequelize.authenticate()
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0')

    const [tables] = await sequelize.query('SHOW TABLES')
    const dbName = sequelize.config.database
    for (const row of tables) {
        const tableName = row[`Tables_in_${dbName}`]
        console.log(`🗑️  Truncating ${tableName}...`)
        await sequelize.query(`TRUNCATE TABLE \`${tableName}\``)
    }

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
    console.log('✅ All tables truncated — structure preserved.')
    await sequelize.close()
}

truncateAll()
