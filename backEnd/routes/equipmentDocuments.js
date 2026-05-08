import { Router } from 'express'
import * as ctrl from '../controlers/equipmentDocumentController.js'

const router = Router()

const handleMulter = (handler) => (req, res, next) => {
    ctrl.uploadMiddleware(req, res, (err) => {
        if (err) {
            const msg = err.code === 'LIMIT_FILE_SIZE'
                ? 'Файл більше 20MB'
                : err.message || 'Помилка завантаження'
            return res.status(400).json({ error: msg })
        }
        handler(req, res, next)
    })
}

router.post('/', handleMulter(ctrl.upload))
router.post('/bulk', handleMulter(ctrl.uploadBulk))

router.get('/', ctrl.list)
router.get('/:id/download', ctrl.download)
router.delete('/:id', ctrl.remove)

export default router
