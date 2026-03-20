import { backPackExtenguisher } from '../models/index.js'

export const getAll = async (req, res) => {
    try {
        const queryOptions = {}
        if (req.user.role === 'SEMI-GOD') {
            queryOptions.where = { '$Brigade.detachmentId$': req.user.detachmentId }
            queryOptions.include = ['Brigade']
        } else if (req.user.role === 'RW') {
            queryOptions.where = { brigadeId: req.user.brigadeId }
        }

        const items = await backPackExtenguisher.findAll(queryOptions)
        res.json(items)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const getByBrigade = async (req, res) => {
    try {
        const { brigadeId } = req.params;
        const items = await backPackExtenguisher.findAll({ where: { brigadeId } });
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Помилка отримання даних' });
    }
}

export const getById = async (req, res) => {
    try {
        const { id } = req.params
        const queryOptions = { where: { id } }

        if (req.user.role === 'SEMI-GOD') {
            queryOptions.include = ['Brigade']
        }

        const item = await backPackExtenguisher.findOne(queryOptions)

        if (!item) {
            return res.status(404).json({ error: 'Not found' })
        }

        if (req.user.role === 'SEMI-GOD' && item.Brigade.detachmentId !== req.user.detachmentId) {
            return res.status(403).json({ error: 'Access denied: wrong detachment' })
        }
        if (req.user.role === 'RW' && item.brigadeId !== req.user.brigadeId) {
            return res.status(403).json({ error: 'Access denied: wrong brigade' })
        }

        res.json(item)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const create = async (req, res) => {
    try {
        const { name, volumeOfWater, typeStern, placeOfStorage, toolListId, brigadeId } = req.body

        if (req.user.role === 'RW' && Number(brigadeId) !== req.user.brigadeId) {
            return res.status(403).json({ error: 'You can only create items for your own brigade' })
        }

        const newItem = await backPackExtenguisher.create({
            name,
            volumeOfWater,
            typeStern,
            placeOfStorage,
            toolListId,
            brigadeId,
        })
        res.status(201).json(newItem)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const update = async (req, res) => {
    try {
        const { id } = req.params
        const { name, volumeOfWater, typeStern, placeOfStorage, toolListId, brigadeId } = req.body

        const item = await backPackExtenguisher.findByPk(id)
        if (!item) return res.status(404).json({ error: 'Not found' })

        if (req.user.role === 'RW' && item.brigadeId !== req.user.brigadeId) {
            return res.status(403).json({ error: 'You can only update items in your own brigade' })
        }
        if (req.user.role === 'RW' && brigadeId && Number(brigadeId) !== req.user.brigadeId) {
            return res.status(403).json({ error: 'Cannot move item to another brigade' })
        }

        await item.update({ name, volumeOfWater, typeStern, placeOfStorage, toolListId, brigadeId })
        res.json(item)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const remove = async (req, res) => {
    try {
        const { id } = req.params
        const item = await backPackExtenguisher.findByPk(id)
        if (!item) return res.status(404).json({ error: 'Not found' })

        if (req.user.role === 'RW' && item.brigadeId !== req.user.brigadeId) {
            return res.status(403).json({ error: 'You can only delete items in your own brigade' })
        }

        await item.destroy()
        res.json({ message: 'Deleted' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}
