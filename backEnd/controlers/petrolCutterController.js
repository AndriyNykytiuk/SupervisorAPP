import { PetrolCutter } from '../models/index.js'
import { createBrigadeScopedController } from '../utils/scopeHelpers.js'

export const { getAll, getById, getByBrigade, create, update, remove } = createBrigadeScopedController(PetrolCutter)
