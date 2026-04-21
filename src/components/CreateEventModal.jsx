import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { createFireEvent } from '../api/services.js'
import '../scss/fireevents.scss'

const CreateEventModal = ({ isOpen, onClose, onCreated }) => {
    const [form, setForm] = useState({
        name: '',
        address: '',
        description: '',
        latitude: '',
        longitude: '',
        startTime: new Date().toISOString().slice(0, 16),
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
                latitude: form.latitude ? parseFloat(form.latitude) : null,
                longitude: form.longitude ? parseFloat(form.longitude) : null,
                startTime: form.startTime ? new Date(form.startTime).toISOString() : null,
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

    return (
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
                    <div className="fe-form-row">
                        <label>
                            Широта (GPS)
                            <input
                                type="number"
                                step="any"
                                value={form.latitude}
                                onChange={(e) => update('latitude', e.target.value)}
                                placeholder="50.6199"
                            />
                        </label>
                        <label>
                            Довгота (GPS)
                            <input
                                type="number"
                                step="any"
                                value={form.longitude}
                                onChange={(e) => update('longitude', e.target.value)}
                                placeholder="26.2516"
                            />
                        </label>
                    </div>
                    <label>
                        Початок
                        <input
                            type="datetime-local"
                            value={form.startTime}
                            onChange={(e) => update('startTime', e.target.value)}
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
        </div>
    )
}

export default CreateEventModal
