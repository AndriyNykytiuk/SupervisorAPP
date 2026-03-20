import { Sequelize } from 'sequelize'
import * as dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

// Support DATABASE_URL (Render provides this) or individual env vars
const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            }
        }
    })
    : new Sequelize(
        process.env.DB_NAME || 'newback_db',
        process.env.DB_USER || process.env.USER || 'postgres',
        process.env.DB_PASS || '',
        {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            dialect: 'postgres',
            logging: false,
            dialectOptions: process.env.DB_SSL === 'true' ? {
                ssl: {
                    require: true,
                    rejectUnauthorized: false,
                }
            } : {}
        }
    )

console.log('DB dialect: postgres')
console.log('DB_HOST:', process.env.DATABASE_URL ? '(using DATABASE_URL)' : (process.env.DB_HOST || 'localhost'))

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
