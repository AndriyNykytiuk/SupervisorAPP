
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)




import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import sequelize, { testConnection } from './config/db.js'
import { authenticate } from './middleware/authenticate.js'
import authRouter from './routes/auth.js'
import userRouter from './routes/users.js'
import detachmentRouter from './routes/detachments.js'
import brigadeRouter from './routes/brigades.js'
import testListRouter from './routes/testList.js'
import testItemRouter from './routes/testItems.js'
import testLinksRouter from './routes/testLinks.js'
import toolListRouter from './routes/toolList.js'
import toolItemRouter from './routes/toolItems.js'
import transferRouter from './routes/transfer.js'
import electricStationsRouter from './routes/electricStations.js'
import waterPumpsRouter from './routes/waterPumps.js'
import hydravlicToolsRouter from './routes/hydravlicTools.js'
import swimToolsRouter from './routes/swimTools.js'
import foamAgentRouter from './routes/foamAgent.js'
import powderRouter from './routes/powder.js'
import extenguisDocumentLinkRouter from './routes/extenguisDocumentlink.js'
import usageLiquidsLogRouter from './routes/usageLiquidsLog.js'
import backPackExtenguisherRouter from './routes/backPackExtenguisher.js'
import genericDatasRouter from './routes/genericDatas.js'
import equipmentArchiveRouter from './routes/equipmentArchive.js'
import vehicleTypesRouter from './routes/vehicleTypes.js'
import equipmentItemsRouter from './routes/equipmentItems.js'
import equipmentAvailabilityRouter from './routes/equipmentAvailability.js'
import searchRouter from './routes/search.js'
import specialToolsRouter from './routes/specialTools.js'
import fireEventsRouter from './routes/fireEvents.js'
import garrisonToolsRouter from './routes/garrisonTools.js'
import surveysRouter from './routes/surveys.js'
import chainSawsRouter from './routes/chainSaws.js'
import pneumaticToolsRouter from './routes/pneumaticTools.js'
import petrolCuttersRouter from './routes/petrolCutters.js'
import fireExtenguishersRouter from './routes/fireExtenguishers.js'
import lightMastsRouter from './routes/lightMasts.js'


const app = express()
const PORT = process.env.PORT || 3000

// Render (and most PaaS) put the app behind a reverse proxy that adds
// X-Forwarded-For. Without trust proxy, express-rate-limit v7 throws
// ERR_ERL_UNEXPECTED_X_FORWARDED_FOR on every request → 500.
app.set('trust proxy', 1)

import fs from 'fs'

// ── Security headers (HSTS, X-Frame-Options, X-Content-Type-Options, etc.) ──
app.use(
    helmet({
        // Vite-built dist uses inline styles and module scripts — allow them in CSP
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:', 'https:'],
                connectSrc: ["'self'", 'https:'],
                fontSrc: ["'self'", 'data:', 'https:'],
            },
        },
        crossOriginEmbedderPolicy: false,
    })
)

// ── Middleware ──────────────────────────────────
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

// ── Global API rate limiter (auth routes have their own stricter limiter) ──
const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    message: { error: 'Забагато запитів. Спробуйте пізніше.' },
    standardHeaders: true,
    legacyHeaders: false,
})
app.use('/api', (req, res, next) => {
    if (req.path.startsWith('/auth')) return next()
    return apiLimiter(req, res, next)
})

// Serve static files from the 'dist' folder (Vite build) - only if it exists (production)
const distPath = path.resolve(__dirname, '../dist')
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath))
}

// ── Auth routes (public — no token needed) ─────
app.use('/api/auth', authRouter)

// ── Protected routes (token required) ──────────
app.use('/api/users', authenticate, userRouter)
app.use('/api/detachments', authenticate, detachmentRouter)
app.use('/api/brigades', authenticate, brigadeRouter)
app.use('/api/test-lists', authenticate, testListRouter)
app.use('/api/test-items', authenticate, testItemRouter)
app.use('/api/test-links', authenticate, testLinksRouter)
app.use('/api/tool-lists', authenticate, toolListRouter)
app.use('/api/tool-items', authenticate, toolItemRouter)
app.use('/api/transfer', authenticate, transferRouter)
app.use('/api/electric-stations', authenticate, electricStationsRouter)
app.use('/api/water-pumps', authenticate, waterPumpsRouter)
app.use('/api/hydravlic-tools', authenticate, hydravlicToolsRouter)
app.use('/api/swim-tools', authenticate, swimToolsRouter)
app.use('/api/foam-agents', authenticate, foamAgentRouter)
app.use('/api/powder', authenticate, powderRouter)
app.use('/api/extenguis-document-links', authenticate, extenguisDocumentLinkRouter)
app.use('/api/usage-liquids-log', authenticate, usageLiquidsLogRouter)
app.use('/api/backpack-extenguishers', authenticate, backPackExtenguisherRouter)
app.use('/api/generic-datas', authenticate, genericDatasRouter)
app.use('/api/archives', authenticate, equipmentArchiveRouter)
app.use('/api/vehicle-types', authenticate, vehicleTypesRouter)
app.use('/api/equipment-items', authenticate, equipmentItemsRouter)
app.use('/api/equipment-availability', authenticate, equipmentAvailabilityRouter)
app.use('/api/search', authenticate, searchRouter)
app.use('/api/special-tools', authenticate, specialToolsRouter)
app.use('/api/fire-events', authenticate, fireEventsRouter)
app.use('/api/garrison-tools', authenticate, garrisonToolsRouter)
app.use('/api/surveys', authenticate, surveysRouter)
app.use('/api/chain-saws', authenticate, chainSawsRouter)
app.use('/api/pneumatic-tools', authenticate, pneumaticToolsRouter)
app.use('/api/petrol-cutters', authenticate, petrolCuttersRouter)
app.use('/api/fire-extenguishers', authenticate, fireExtenguishersRouter)
app.use('/api/light-masts', authenticate, lightMastsRouter)

// ── Catch-all: serve index.html for any other route (React routing) ─────
const indexPath = path.resolve(__dirname, '../dist/index.html')
if (fs.existsSync(indexPath)) {
    app.get('/{*path}', (req, res) => {
        res.sendFile(indexPath)
    })
} else {
    // ── 404 handler for local development (when dist is missing) ──────────
    app.use((req, res) => {
        res.status(404).json({ error: 'Endpoint not found, and /dist folder is missing' })
    })
}

// ── Error handler ──────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack)
    const isProd = process.env.NODE_ENV === 'production'
    res.status(500).json({
        error: isProd ? 'Internal server error' : err.message,
    })
})

// ── Запуск ─────────────────────────────────────
async function start() {
    await testConnection()

    // Disable global alter to avoid ER_TOO_MANY_KEYS on Detachments bug
    await sequelize.sync()

    // ── Safe one-time migrations (run on ALL environments) ──────
    try {
        const { VehicleType, EquipmentItem, EquipmentAvailability, BrigadeVehicle, testList } = await import('./models/index.js')
        await VehicleType.sync({ alter: true })
        await EquipmentItem.sync({ alter: true })
        await EquipmentAvailability.sync({ alter: true })
        await BrigadeVehicle.sync({ alter: true })
        await testList.sync({ alter: true })

        // Idempotent additive: Users.detachmentId for SEMI-GOD direct binding.
        // Raw SQL (not User.sync alter) to avoid touching the role ENUM.
        await sequelize.query(`
            ALTER TABLE "Users"
            ADD COLUMN IF NOT EXISTS "detachmentId" INTEGER
            REFERENCES "Detachments"(id) ON UPDATE CASCADE ON DELETE SET NULL
        `)
        console.log('📦 Core equipment tables successfully synchronized with alter:true')
    } catch (e) {
        console.error('Migration error:', e.message)
    }

    if (process.env.NODE_ENV !== 'production') {
        // Explicitly alter TestItem and ToolItem to add the new columns
        const { User, TestItem, ToolItem, ElectricStations, WaterPumps, HydravlicTool, SwimTools, FoamAgent, Powder, ExtenguisDocumentLink, UsageLiquidsLog, backPackExtenguisher, EquipmentArchive, VehicleType, EquipmentItem, EquipmentAvailability, BrigadeVehicle } = await import('./models/index.js')
        await User.sync({ alter: true })
        await ElectricStations.sync({ alter: true })
        await WaterPumps.sync({ alter: true })
        await HydravlicTool.sync({ alter: true })
        await SwimTools.sync({ alter: true })
        await FoamAgent.sync({ alter: true })
        await Powder.sync({ alter: true })
        await ExtenguisDocumentLink.sync({ alter: true })
        await UsageLiquidsLog.sync({ alter: true })
        await backPackExtenguisher.sync({ alter: true })
        await EquipmentArchive.sync({ alter: true })
        await VehicleType.sync({ alter: true })
        await EquipmentItem.sync({ alter: true })
        await EquipmentAvailability.sync({ alter: true })
        await BrigadeVehicle.sync({ alter: true })
        const { SpecialTool, FireEvent, EventTeam, EventHistory, SurveyForm, SurveyResponse, ChainSaw, PneumaticTool, PetrolCutter, FireExtenguisher, LightMast } = await import('./models/index.js')
        await SpecialTool.sync({ alter: true })
        await FireEvent.sync({ alter: true })
        await EventTeam.sync({ alter: true })
        await EventHistory.sync({ alter: true })
        await SurveyForm.sync({ alter: true })
        await SurveyResponse.sync({ alter: true })
        await ChainSaw.sync({ alter: true })
        await PneumaticTool.sync({ alter: true })
        await PetrolCutter.sync({ alter: true })
        await FireExtenguisher.sync({ alter: true })
        await LightMast.sync({ alter: true })
        console.log('📦 Tables altered for development environment')
    } else {
        console.log('📦 Tables verified for production (no alter)')
    }

    app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`)
    }).on('error', (err) => {
        console.error('Failed to start server:', err)
    })
}

start()
