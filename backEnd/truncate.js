import 'dotenv/config'
import sequelize from './config/db.js'

async function truncateAll() {
    await sequelize.authenticate()

    // Disable foreign key checks (PostgreSQL)
    await sequelize.query('SET session_replication_role = \'replica\'')

    const [tables] = await sequelize.query(`
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public'
    `)

    for (const row of tables) {
        const tableName = row.tablename
        console.log(`🗑️  Truncating ${tableName}...`)
        await sequelize.query(`TRUNCATE TABLE "${tableName}" CASCADE`)
    }

    // Re-enable foreign key checks
    await sequelize.query('SET session_replication_role = \'origin\'')
    console.log('✅ All tables truncated — structure preserved.')
    await sequelize.close()
}

truncateAll()
