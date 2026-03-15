import bcrypt from 'bcrypt'
import { User } from '../models/index.js'

const SALT_ROUNDS = 10

// GET /api/users
export const getAll = async (req, res, next) => {
    try {
        const users = await User.findAll()
        res.json(users)
    } catch (err) {
        next(err)
    }
}

// GET /api/users/:id
export const getById = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id)
        if (!user) return res.status(404).json({ error: 'User not found' })
        res.json(user)
    } catch (err) {
        next(err)
    }
}

// POST /api/users
export const create = async (req, res, next) => {
    try {
        const data = { ...req.body }
        if (data.password) {
            data.password = await bcrypt.hash(data.password, SALT_ROUNDS)
        }
        const user = await User.create(data)
        res.status(201).json(user)
    } catch (err) {
        next(err)
    }
}

// PUT /api/users/:id
export const update = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id)
        if (!user) return res.status(404).json({ error: 'User not found' })
        const data = { ...req.body }
        if (data.password) {
            data.password = await bcrypt.hash(data.password, SALT_ROUNDS)
        }
        await user.update(data)
        res.json(user)
    } catch (err) {
        next(err)
    }
}

// DELETE /api/users/:id
export const remove = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id)
        if (!user) return res.status(404).json({ error: 'User not found' })
        await user.destroy()
        res.json({ message: 'User deleted' })
    } catch (err) {
        next(err)
    }
}
