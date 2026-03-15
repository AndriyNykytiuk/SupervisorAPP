import { toolList } from '../models/index.js'

// GET /api/tool-lists — all authenticated users can read
export const getAll = async (req, res, next) => {
    try {
        const lists = await toolList.findAll()
        res.json(lists)
    } catch (err) {
        next(err)
    }
}

// GET /api/tool-lists/:id
export const getById = async (req, res, next) => {
    try {
        const list = await toolList.findByPk(req.params.id)
        if (!list) return res.status(404).json({ error: 'Tool list not found' })
        res.json(list)
    } catch (err) {
        next(err)
    }
}

// POST /api/tool-lists — GOD only
export const create = async (req, res, next) => {
    try {
        const list = await toolList.create(req.body)
        res.status(201).json(list)
    } catch (err) {
        next(err)
    }
}

// PUT /api/tool-lists/:id — GOD only
export const update = async (req, res, next) => {
    try {
        const list = await toolList.findByPk(req.params.id)
        if (!list) return res.status(404).json({ error: 'Tool list not found' })
        await list.update(req.body)
        res.json(list)
    } catch (err) {
        next(err)
    }
}

// DELETE /api/tool-lists/:id — GOD only
export const remove = async (req, res, next) => {
    try {
        const list = await toolList.findByPk(req.params.id)
        if (!list) return res.status(404).json({ error: 'Tool list not found' })
        await list.destroy()
        res.json({ message: 'Tool list deleted' })
    } catch (err) {
        next(err)
    }
}
