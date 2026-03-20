import 'dotenv/config'
import sequelize from './backEnd/config/db.js'

async function clearTestItems() {
    try {
        await sequelize.authenticate()
        console.log('📡 Connected to database...')

        // Disable foreign key checks to allow truncation if there are dependencies
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0')

        console.log('🗑️  Clearing all TestItems...')
        await sequelize.query('TRUNCATE TABLE `TestItems`')

        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
        console.log('✅ TestItems cleared successfully!')

    } catch (err) {
        console.error('❌ Error clearing TestItems:', err.message)
    } finally {
        await sequelize.close()
    }
}

clearTestItems()
