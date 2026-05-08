import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'react-toastify'
import {
    updateFireEvent,
    fetchDetachments,
    addEventTeam,
    removeEventTeam,
} from '../api/services.js'
import DateTimePicker from './ui/DateTimePicker.jsx'
import '../scss/fireevents.scss'

const EditEventModal = ({ event, onClose, onSaved }) => {
    const [form, setForm] = useState({ name: '', address: '', description: '', startTime: new Date() })
    const [saving, setSaving] = useState(false)
    const [detachments, setDetachments] = useState([])
    const [selectedBrigadeIds, setSelectedBrigadeIds] = useState(new Set())
    const [openDetachments, setOpenDetachments] = useState(new Set())

    useEffect(() => {
        if (!event) return
        setForm({
            name: event.name || '',
            address: event.address || '',
            description: event.description || '',
            startTime: event.startTime ? new Date(event.startTime) : new Date(),
        })
        const existing = new Set((event.EventTeams || []).map((t) => t.brigadeId))
        setSelectedBrigadeIds(existing)

        fetchDetachments().then(setDetachments).catch(() => {})
    }, [event])

    if (!event) return null

    const update = (field, val) => setForm((f) => ({ ...f, [field]: val }))

    const toggleBrigade = (brigadeId) => {
        setSelectedBrigadeIds((prev) => {
            const next = new Set(prev)
            next.has(brigadeId) ? next.delete(brigadeId) : next.add(brigadeId)
            return next
        })
    }

    const toggleDetachment = (detachmentId) => {
        setOpenDetachments((prev) => {
            const next = new Set(prev)
            next.has(detachmentId) ? next.delete(detachmentId) : next.add(detachmentId)
            return next
        })
    }

    const toggleAllInDetachment = (det) => {
        const ids = (det.Brigades || []).map((b) => b.id)
        const allSelected = ids.every((id) => selectedBrigadeIds.has(id))
        setSelectedBrigadeIds((prev) => {
            const next = new Set(prev)
            ids.forEach((id) => allSelected ? next.delete(id) : next.add(id))
            return next
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.name.trim()) {
            toast.error('Назва події обовʼязкова')
            return
        }
        setSaving(true)
        try {
            await updateFireEvent(event.id, {
                name: form.name.trim(),
                address: form.address.trim() || null,
                description: form.description.trim() || null,
                startTime: form.startTime ? form.startTime.toISOString() : null,
            })

            // sync brigades: add new, remove deselected
            const existingTeams = event.EventTeams || []
            const existingBrigadeIds = new Set(existingTeams.map((t) => t.brigadeId))

            const toAdd = [...selectedBrigadeIds].filter((id) => !existingBrigadeIds.has(id))
            const toRemove = existingTeams.filter((t) => !selectedBrigadeIds.has(t.brigadeId))

            await Promise.all([
                ...toAdd.map((brigadeId) => addEventTeam(event.id, { brigadeId })),
                ...toRemove.map((t) => removeEventTeam(t.id)),
            ])

            toast.success('Подію оновлено')
            onSaved?.()
            onClose()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка оновлення')
        } finally {
            setSaving(false)
        }
    }

    return createPortal(
        <div className="fe-modal-overlay" onClick={onClose}>
            <div className="fe-modal fe-modal-wide" onClick={(e) => e.stopPropagation()}>
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

                    {/* ── Склад зведеного загону ── */}
                    <div className="fe-consolidated-section">
                        <div className="fe-consolidated-header">
                            <span>Зведений загін</span>
                            {selectedBrigadeIds.size > 0 && (
                                <span className="fe-consolidated-badge">
                                    {selectedBrigadeIds.size} частин обрано
                                </span>
                            )}
                        </div>

                        {detachments.length === 0 ? (
                            <p className="fe-muted" style={{ fontSize: '.85rem', margin: '.5rem 0 0' }}>
                                Завантаження...
                            </p>
                        ) : (
                            <div className="fe-detachment-list">
                                {detachments.map((det) => {
                                    const brigades = det.Brigades || []
                                    const isOpen = openDetachments.has(det.id)
                                    const selectedCount = brigades.filter((b) => selectedBrigadeIds.has(b.id)).length
                                    const allSelected = brigades.length > 0 && selectedCount === brigades.length

                                    return (
                                        <div key={det.id} className="fe-detachment-item">
                                            <div
                                                className="fe-detachment-row"
                                                onClick={() => toggleDetachment(det.id)}
                                            >
                                                <span className="fe-detachment-arrow">{isOpen ? '▾' : '▸'}</span>
                                                <span className="fe-detachment-name">{det.name}</span>
                                                {selectedCount > 0 && (
                                                    <span className="fe-detachment-count">{selectedCount}/{brigades.length}</span>
                                                )}
                                                {brigades.length > 0 && (
                                                    <button
                                                        type="button"
                                                        className="fe-select-all-btn"
                                                        onClick={(e) => { e.stopPropagation(); toggleAllInDetachment(det) }}
                                                    >
                                                        {allSelected ? 'зняти всі' : 'обрати всі'}
                                                    </button>
                                                )}
                                            </div>

                                            {isOpen && (
                                                <div className="fe-brigade-list">
                                                    {brigades.length === 0 ? (
                                                        <span className="fe-muted" style={{ fontSize: '.82rem' }}>Немає частин</span>
                                                    ) : brigades.map((brigade) => (
                                                        <label key={brigade.id} className="fe-brigade-checkbox">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedBrigadeIds.has(brigade.id)}
                                                                onChange={() => toggleBrigade(brigade.id)}
                                                            />
                                                            {brigade.name}
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

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
