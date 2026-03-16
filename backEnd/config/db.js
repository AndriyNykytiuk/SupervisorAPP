import { Sequelize } from 'sequelize'
import * as dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const sequelize = new Sequelize(
    process.env.DB_NAME || 'newback_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
            ssl: process.env.DB_SSL === 'true' ? {
                rejectUnauthorized: false
            } : false
        }
    }
)

export async function testConnection() {
    try {
        await sequelize.authenticate()
        console.log('DB connected successfully')
    } catch (err) {
        console.error(' DB connection failed:', err.message)
        process.exit(1)
    }
}

export default sequelize
