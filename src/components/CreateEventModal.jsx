import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'react-toastify'
import { createFireEvent } from '../api/services.js'
import DateTimePicker from './ui/DateTimePicker.jsx'
import '../scss/fireevents.scss'

const CreateEventModal = ({ isOpen, onClose, onCreated }) => {
    const [form, setForm] = useState({
        name: '',
        address: '',
        description: '',
        startTime: new Date(),
    })
    const [saving, setSaving] = useState(false)

    if (!isOpen) return null

    const update = (field, val) => setForm((f) => ({ ...f, [field]: val }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.name.trim()) {
            toast.error('Назва події обовʼязкова')
            return
        }
        setSaving(true)
        try {
            const payload = {
                name: form.name.trim(),
                address: form.address.trim() || null,
                description: form.description.trim() || null,
                startTime: form.startTime ? form.startTime.toISOString() : null,
            }
            const event = await createFireEvent(payload)
            toast.success('Подію створено')
            onCreated?.(event)
            onClose()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка створення події')
        } finally {
            setSaving(false)
        }
    }

    return createPortal(
        <div className="fe-modal-overlay" onClick={onClose}>
            <div className="fe-modal" onClick={(e) => e.stopPropagation()}>
                <div className="fe-modal-header">
                    <h3>Нова подія</h3>
                    <button className="fe-close" onClick={onClose}>✕</button>
                </div>
                <form className="fe-form" onSubmit={handleSubmit}>
                    <label>
                        Назва *
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => update('name', e.target.value)}
                            placeholder="Напр. Пожежа на території ТРЦ"
                            required
                        />
                    </label>
                    <label>
                        Адреса
                        <input
                            type="text"
                            value={form.address}
                            onChange={(e) => update('address', e.target.value)}
                            placeholder="м. Рівне, вул..."
                        />
                    </label>
                    <label>
                        Початок
                        <DateTimePicker
                            value={form.startTime}
                            onChange={(d) => update('startTime', d)}
                        />
                    </label>
                    <label>
                        Опис
                        <textarea
                            rows={4}
                            value={form.description}
                            onChange={(e) => update('description', e.target.value)}
                            placeholder="Коротка характеристика події"
                        />
                    </label>
                    <div className="fe-form-actions">
                        <button type="button" className="fe-btn fe-btn-secondary" onClick={onClose}>
                            Скасувати
                        </button>
                        <button type="submit" className="fe-btn fe-btn-primary" disabled={saving}>
                            {saving ? 'Створюю...' : 'Створити подію'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    )
}

export default CreateEventModal
