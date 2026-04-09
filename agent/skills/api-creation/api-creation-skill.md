# API Creation Skill

## Stack
- Express.js + Sequelize + MySQL
- Auth: JWT, role stored in req.user
- Scope: req.scope (null=GOD, detachmentId=SEMI-GOD, brigadeId=RW)

## Project Structure
backEnd/
├── controllers/   ← вся логіка тут
├── routes/        ← тільки роути
├── models/        ← Sequelize моделі
└── middleware/    ← authenticate.js вже існує

## URL Pattern
/api/:resource
/api/:resource/:id

## Role Access Pattern
const checkAccess = async (brigadeId, scope) => {
    if (!scope) return true  // GOD
    if (scope.brigadeId) return Number(scope.brigadeId) === Number(brigadeId)  // RW
    if (scope.detachmentId) {
        const brigade = await Brigade.findByPk(brigadeId)
        return brigade?.detachmentId === scope.detachmentId  // SEMI-GOD
    }
    return false
}

## Controller Template
export const getAll = async (req, res, next) => {
    try {
        let where = {}
        if (req.scope?.brigadeId) where.brigadeId = req.scope.brigadeId
        else if (req.scope?.detachmentId) {
            const brigades = await Brigade.findAll({
                where: { detachmentId: req.scope.detachmentId },
                attributes: ['id']
            })
            where.brigadeId = brigades.map(b => b.id)
        }
        const items = await Model.findAll({ where, include: [Brigade] })
        res.json(items)
    } catch (err) { next(err) }
}

export const create = async (req, res, next) => {
    try {
        if (req.scope?.detachmentId && !req.scope.brigadeId) {
            return res.status(403).json({ error: 'Forbidden: SEMI-GOD is read-only' })
        }
        const brigadeId = req.scope?.brigadeId ?? req.body.brigadeId
        const item = await Model.create({ ...req.body, brigadeId })
        res.status(201).json(item)
    } catch (err) { next(err) }
}

export const update = async (req, res, next) => {
    try {
        const item = await Model.findByPk(req.params.id)
        if (!item) return res.status(404).json({ error: 'Not found' })
        if (req.scope?.detachmentId && !req.scope.brigadeId)
            return res.status(403).json({ error: 'Forbidden: SEMI-GOD is read-only' })
        const allowed = await checkAccess(item.brigadeId, req.scope)
        if (!allowed) return res.status(403).json({ error: 'Forbidden' })
        const { brigadeId, id, ...updates } = req.body
        await item.update(updates)
        res.json(item)
    } catch (err) { next(err) }
}

export const remove = async (req, res, next) => {
    try {
        const item = await Model.findByPk(req.params.id)
        if (!item) return res.status(404).json({ error: 'Not found' })
        if (req.scope?.detachmentId && !req.scope.brigadeId)
            return res.status(403).json({ error: 'Forbidden: SEMI-GOD is read-only' })
        const allowed = await checkAccess(item.brigadeId, req.scope)
        if (!allowed) return res.status(403).json({ error: 'Forbidden' })
        await item.destroy()
        res.status(204).end()
    } catch (err) { next(err) }
}

## Route Template
import { Router } from 'express'
import * as ctrl from '../controllers/modelController.js'

const router = Router()
router.get('/',     ctrl.getAll)
router.get('/:id',  ctrl.getById)
router.post('/',    ctrl.create)
router.put('/:id',  ctrl.update)
router.delete('/:id', ctrl.remove)
export default router

## Mount in server.js
app.use('/api/resource-name', authenticate, resourceRouter)