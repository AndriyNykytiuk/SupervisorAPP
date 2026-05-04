import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'react-toastify'
import { updateFireEvent } from '../api/services.js'
import DateTimePicker from './ui/DateTimePicker.jsx'
import '../scss/fireevents.scss'

const EditEventModal = ({ event, onClose, onSaved }) => {
    const [form, setForm] = useState({ name: '', address: '', description: '', startTime: new Date() })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!event) return
        setForm({
            name: event.name || '',
            address: event.address || '',
            description: event.description || '',
            startTime: event.startTime ? new Date(event.startTime) : new Date(),
        })
    }, [event])

    if (!event) return null

    const update = (field, val) => setForm((f) => ({ ...f, [field]: val }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.name.trim()) {
            toast.error('Назва події обовʼязкова')
            return
        }
        setSaving(true)
        try {
            const updated = await updateFireEvent(event.id, {
                name: form.name.trim(),
                address: form.address.trim() || null,
                description: form.description.trim() || null,
                startTime: form.startTime ? form.startTime.toISOString() : null,
            })
            toast.success('Подію оновлено')
            onSaved?.(updated)
            onClose()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка оновлення')
        } finally {
            setSaving(false)
        }
    }

    return createPortal(
        <div className="fe-modal-overlay" onClick={onClose}>
            <div className="fe-modal" onClick={(e) => e.stopPropagation()}>
                <div className="fe-modal-header">
                    <h3>Редагувати подію</h3>
                    <button className="fe-close" onClick={onClose}>✕</button>
                </div>
                <form className="fe-form" onSubmit={handleSubmit}>
                    <label>
                        Назва *
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => update('name', e.target.value)}
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
                            {saving ? 'Збереження...' : 'Зберегти зміни'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    )
}

export default EditEventModal
