import * as dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// If server.js is in /Users/.../newBack/backEnd, then __dirname is that folder. 
// We want the .env file in /Users/.../newBack/.env, which is exactly one level up from __dirname.
// Let's use path.resolve to be extremely explicit.
dotenv.config({ path: path.resolve(__dirname, '../.env') })

import express from 'express'
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

const app = express()
const PORT = process.env.PORT || 3000

import fs from 'fs'

// ── Middleware ──────────────────────────────────
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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

// ── Error handler ──────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: err.message })
})

// ── Запуск ─────────────────────────────────────
async function start() {
    await testConnection()

    // Disable global alter to avoid ER_TOO_MANY_KEYS on Detachments bug
    await sequelize.sync()

    // Explicitly alter TestItem and ToolItem to add the new columns
    const { TestItem, ToolItem, ElectricStations, WaterPumps, HydravlicTool, SwimTools, FoamAgent, Powder } = await import('./models/index.js')
    // await TestItem.sync({ alter: true })
    // await ToolItem.sync({ alter: true })
    await ElectricStations.sync({ alter: true })
    await WaterPumps.sync({ alter: true })
    await HydravlicTool.sync({ alter: true })
    await SwimTools.sync({ alter: true })
    await FoamAgent.sync({ alter: true })
    await Powder.sync({ alter: true })

    const { ExtenguisDocumentLink } = await import('./models/index.js')
    await ExtenguisDocumentLink.sync({ alter: true })

    const { UsageLiquidsLog } = await import('./models/index.js')
    await UsageLiquidsLog.sync({ alter: true })

    console.log('📦 Tables synced')

    app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`)
    }).on('error', (err) => {
        console.error('Failed to start server:', err)
    })
}

start()
