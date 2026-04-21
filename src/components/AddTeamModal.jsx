import React, { useState, useEffect, useMemo } from 'react'
import { toast } from 'react-toastify'
import {
    fetchTransferBrigades,
    fetchUsersByBrigade,
    fetchGarrisonTools,
    addEventTeam,
    updateEventTeam,
} from '../api/services.js'
import '../scss/fireevents.scss'

const emptyForm = {
    brigadeId: '',
    locationName: '',
    seniorUserId: '',
    seniorNameText: '',
    useCustomSenior: false,
    peopleCount: '',
    vehicles: '',
    fuel: '',
    notes: '',
}

const AddTeamModal = ({ isOpen, eventId, team, onClose, onSaved }) => {
    const isEdit = !!team
    const [form, setForm] = useState(emptyForm)
    const [equipment, setEquipment] = useState([]) // [{id, name, category, quantity, brigadeId, brigadeName}]
    const [brigades, setBrigades] = useState([])
    const [users, setUsers] = useState([])
    const [toolGroups, setToolGroups] = useState([])
    const [toolSearch, setToolSearch] = useState('')
    const [saving, setSaving] = useState(false)
    const [showToolPicker, setShowToolPicker] = useState(false)

    useEffect(() => {
        if (!isOpen) return
        fetchTransferBrigades().then(setBrigades).catch(() => setBrigades([]))
        fetchGarrisonTools().then(setToolGroups).catch(() => setToolGroups([]))
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return
        if (isEdit && team) {
            setForm({
                brigadeId: team.brigadeId || '',
                locationName: team.locationName || '',
                seniorUserId: team.seniorUserId || '',
                seniorNameText: team.seniorNameText || '',
                useCustomSenior: !team.seniorUserId && !!team.seniorNameText,
                peopleCount: team.peopleCount ?? '',
                vehicles: team.vehicles || '',
                fuel: team.fuel || '',
                notes: team.notes || '',
            })
            setEquipment(Array.isArray(team.equipment) ? team.equipment : [])
        } else {
            setForm(emptyForm)
            setEquipment([])
        }
    }, [isOpen, isEdit, team])

    useEffect(() => {
        if (!form.brigadeId) {
            setUsers([])
            return
        }
        fetchUsersByBrigade(form.brigadeId)
            .then(setUsers)
            .catch(() => setUsers([]))
    }, [form.brigadeId])

    const update = (field, val) => setForm((f) => ({ ...f, [field]: val }))

    const filteredToolGroups = useMemo(() => {
        if (!toolSearch.trim()) return toolGroups
        const q = toolSearch.toLowerCase()
        return toolGroups
            .map((g) => ({
                ...g,
                items: g.items.filter(
                    (i) =>
                        i.name?.toLowerCase().includes(q) ||
                        i.brigadeName?.toLowerCase().includes(q) ||
                        g.category.toLowerCase().includes(q)
                ),
            }))
            .filter((g) => g.items.length > 0)
    }, [toolGroups, toolSearch])

    const addEquipment = (tool) => {
        setEquipment((prev) => {
            if (prev.some((t) => t.id === tool.id)) return prev
            return [...prev, { ...tool, quantity: 1 }]
        })
    }

    const removeEquipment = (toolId) => {
        setEquipment((prev) => prev.filter((t) => t.id !== toolId))
    }

    const changeEquipmentQty = (toolId, qty) => {
        setEquipment((prev) =>
            prev.map((t) => (t.id === toolId ? { ...t, quantity: Math.max(1, Number(qty) || 1) } : t))
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.brigadeId) {
            toast.error('Оберіть частину')
            return
        }
        setSaving(true)
        try {
            const payload = {
                brigadeId: Number(form.brigadeId),
                locationName: form.locationName.trim() || null,
                seniorUserId: form.useCustomSenior ? null : (form.seniorUserId ? Number(form.seniorUserId) : null),
                seniorNameText: form.useCustomSenior ? (form.seniorNameText.trim() || null) : null,
                peopleCount: form.peopleCount !== '' ? Number(form.peopleCount) : 0,
                vehicles: form.vehicles.trim() || null,
                fuel: form.fuel.trim() || null,
                notes: form.notes.trim() || null,
                equipment,
            }
            const updated = isEdit
                ? await updateEventTeam(team.id, payload)
                : await addEventTeam(eventId, payload)
            toast.success(isEdit ? 'Команду оновлено' : 'Команду додано')
            onSaved?.(updated)
            onClose()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка збереження')
        } finally {
            setSaving(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fe-modal-overlay" onClick={onClose}>
            <div className="fe-modal fe-modal-wide" onClick={(e) => e.stopPropagation()}>
                <div className="fe-modal-header">
                    <h3>{isEdit ? 'Редагувати команду' : 'Нова команда'}</h3>
                    <button className="fe-close" onClick={onClose}>✕</button>
                </div>
                <form className="fe-form" onSubmit={handleSubmit}>
                    <div className="fe-form-row">
                        <label>
                            Частина *
                            <select
                                value={form.brigadeId}
                                onChange={(e) => update('brigadeId', e.target.value)}
                                required
                                disabled={isEdit}
                            >
                                <option value="">Оберіть частину</option>
                                {brigades.map((b) => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Локація команди
                            <input
                                type="text"
                                value={form.locationName}
                                onChange={(e) => update('locationName', e.target.value)}
                                placeholder="Напр. Східний сектор"
                            />
                        </label>
                    </div>

                    <div className="fe-form-row">
                        <label className="fe-full">
                            Старша особа
                            {!form.useCustomSenior ? (
                                <select
                                    value={form.seniorUserId}
                                    onChange={(e) => update('seniorUserId', e.target.value)}
                                    disabled={!form.brigadeId}
                                >
                                    <option value="">— не обрано —</option>
                                    {users.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.name}{u.role ? ` (${u.role})` : ''}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={form.seniorNameText}
                                    onChange={(e) => update('seniorNameText', e.target.value)}
                                    placeholder="ПІБ старшої особи"
                                />
                            )}
                            <label className="fe-checkbox">
                                <input
                                    type="checkbox"
                                    checked={form.useCustomSenior}
                                    onChange={(e) => update('useCustomSenior', e.target.checked)}
                                />
                                Ввести вручну (особа не з БД)
                            </label>
                        </label>
                    </div>

                    <div className="fe-form-row">
                        <label>
                            Кількість людей
                            <input
                                type="number"
                                min="0"
                                value={form.peopleCount}
                                onChange={(e) => update('peopleCount', e.target.value)}
                                placeholder="0"
                            />
                        </label>
                        <label>
                            Техніка
                            <input
                                type="text"
                                value={form.vehicles}
                                onChange={(e) => update('vehicles', e.target.value)}
                                placeholder="Напр. АЦ-40, АП-5..."
                            />
                        </label>
                    </div>

                    <div className="fe-form-row">
                        <label>
                            ПММ
                            <input
                                type="text"
                                value={form.fuel}
                                onChange={(e) => update('fuel', e.target.value)}
                                placeholder="Напр. дизель 200л, бензин 50л"
                            />
                        </label>
                    </div>

                    <div className="fe-equipment-section">
                        <div className="fe-equipment-header">
                            <strong>Обладнання ({equipment.length})</strong>
                            <button
                                type="button"
                                className="fe-btn fe-btn-secondary fe-btn-sm"
                                onClick={() => setShowToolPicker((s) => !s)}
                            >
                                {showToolPicker ? 'Згорнути' : 'Додати обладнання'}
                            </button>
                        </div>

                        {equipment.length > 0 && (
                            <ul className="fe-equipment-list">
                                {equipment.map((t) => (
                                    <li key={t.id}>
                                        <span className="fe-eq-cat">{t.category}</span>
                                        <span className="fe-eq-name">{t.name}</span>
                                        <span className="fe-eq-brig">{t.brigadeName}</span>
                                        <input
                                            type="number"
                                            min="1"
                                            className="fe-eq-qty"
                                            value={t.quantity}
                                            onChange={(e) => changeEquipmentQty(t.id, e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="fe-eq-remove"
                                            onClick={() => removeEquipment(t.id)}
                                        >
                                            ✕
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {showToolPicker && (
                            <div className="fe-tool-picker">
                                <input
                                    type="text"
                                    placeholder="Пошук обладнання / частини..."
                                    value={toolSearch}
                                    onChange={(e) => setToolSearch(e.target.value)}
                                />
                                <div className="fe-tool-picker-body">
                                    {filteredToolGroups.length === 0 && (
                                        <p className="fe-muted">Нічого не знайдено</p>
                                    )}
                                    {filteredToolGroups.map((g) => (
                                        <div key={g.category} className="fe-tool-group">
                                            <h5>{g.category}</h5>
                                            <ul>
                                                {g.items.map((it) => {
                                                    const picked = equipment.some((e) => e.id === it.id)
                                                    return (
                                                        <li key={it.id}>
                                                            <button
                                                                type="button"
                                                                className={`fe-tool-item ${picked ? 'picked' : ''}`}
                                                                onClick={() =>
                                                                    picked ? removeEquipment(it.id) : addEquipment(it)
                                                                }
                                                            >
                                                                <span>{it.name}</span>
                                                                {it.characteristic && (
                                                                    <small>{it.characteristic}</small>
                                                                )}
                                                                <em>{it.brigadeName}</em>
                                                            </button>
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <label>
                        Нотатки
                        <textarea
                            rows={3}
                            value={form.notes}
                            onChange={(e) => update('notes', e.target.value)}
                            placeholder="Додаткова інформація"
                        />
                    </label>

                    <div className="fe-form-actions">
                        <button type="button" className="fe-btn fe-btn-secondary" onClick={onClose}>
                            Скасувати
                        </button>
                        <button type="submit" className="fe-btn fe-btn-primary" disabled={saving}>
                            {saving ? 'Зберігаю...' : (isEdit ? 'Зберегти' : 'Додати команду')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddTeamModal
