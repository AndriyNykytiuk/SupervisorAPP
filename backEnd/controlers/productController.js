import { Product } from '../models/index.js'

// GET /api/products
export const getAll = async (req, res, next) => {
    try {
        const products = await Product.findAll()
        res.json(products)
    } catch (err) {
        next(err)
    }
}

// GET /api/products/:id
export const getById = async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id)
        if (!product) return res.status(404).json({ error: 'Product not found' })
        res.json(product)
    } catch (err) {
        next(err)
    }
}

// POST /api/products
export const create = async (req, res, next) => {
    try {
        const product = await Product.create(req.body)
        res.status(201).json(product)
    } catch (err) {
        next(err)
    }
}

// PUT /api/products/:id
export const update = async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id)
        if (!product) return res.status(404).json({ error: 'Product not found' })
        await product.update(req.body)
        res.json(product)
    } catch (err) {
        next(err)
    }
}

// DELETE /api/products/:id
export const remove = async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id)
        if (!product) return res.status(404).json({ error: 'Product not found' })
        await product.destroy()
        res.json({ message: 'Product deleted' })
    } catch (err) {
        next(err)
    }
}
