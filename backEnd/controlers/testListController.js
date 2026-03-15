import { testList, TestItem } from '../models/index.js'

// GET /api/test-lists — any authenticated user can read
export const getAll = async (req, res, next) => {
    try {
        const lists = await testList.findAll()
        res.json(lists)
    } catch (err) {
        next(err)
    }
}

// GET /api/test-lists/:id — any authenticated user can read
export const getById = async (req, res, next) => {
    try {
        const list = await testList.findByPk(req.params.id)
        if (!list) return res.status(404).json({ error: 'Test list not found' })
        res.json(list)
    } catch (err) {
        next(err)
    }
}

// POST /api/test-lists — GOD only
export const create = async (req, res, next) => {
    try {
        const list = await testList.create(req.body)
        res.status(201).json(list)
    } catch (err) {
        next(err)
    }
}

// PUT /api/test-lists/:id — GOD only
export const update = async (req, res, next) => {
    try {
        const list = await testList.findByPk(req.params.id)
        if (!list) return res.status(404).json({ error: 'Test list not found' })
        await list.update(req.body)
        res.json(list)
    } catch (err) {
        next(err)
    }
}

// DELETE /api/test-lists/:id — GOD only
export const remove = async (req, res, next) => {
    try {
        const list = await testList.findByPk(req.params.id)
        if (!list) return res.status(404).json({ error: 'Test list not found' })
        await list.destroy()
        res.json({ message: 'Test list deleted' })
    } catch (err) {
        next(err)
    }
}