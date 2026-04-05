import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { toast } from 'react-toastify'
import {
    fetchVehicleTypes,
    createVehicleType,
    deleteVehicleType,
    fetchEquipmentItems,
    createEquipmentItem,
    updateEquipmentItem,
    deleteEquipmentItem,
    fetchEquipmentAvailability,
    createEquipmentAvailability,
    updateEquipmentAvailability,
} from '../api/services.js'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
import { MdDelete, MdAdd } from 'react-icons/md'
import '../scss/generalrequirements.scss'

const GeneralRequirements = ({ selectedBrigade }) => {
    const { user } = useAuth()
    const isGod = user?.role === 'GOD'
    const isRW = user?.role === 'RW'

    const [vehicleTypes, setVehicleTypes] = useState([])
    const [selectedType, setSelectedType] = useState('')
    const [items, setItems] = useState([])
    const [availability, setAvailability] = useState([])
    const [loading, setLoading] = useState(false)

    // New vehicle type form
    const [newTypeName, setNewTypeName] = useState('')
    // New equipment item form
    const [newItemName, setNewItemName] = useState('')
    const [newItemNorm, setNewItemNorm] = useState('')
    const [newItemBrigadeNorm, setNewItemBrigadeNorm] = useState('')

    // ── Load vehicle types ──────────────────────────
    useEffect(() => {
        loadVehicleTypes()
    }, [])

    const loadVehicleTypes = async () => {
        try {
            const data = await fetchVehicleTypes()
            setVehicleTypes(data)
            if (data.length > 0 && !selectedType) {
                setSelectedType(data[0].id)
            }
        } catch (err) {
            console.error('Failed to load vehicle types:', err)
        }
    }

    // ── Load items + availability when type or brigade changes ──
    useEffect(() => {
        if (!selectedType) return
        loadData()
    }, [selectedType, selectedBrigade])

    const loadData = async () => {
        setLoading(true)
        try {
            const [itemsData, availData] = await Promise.all([
                fetchEquipmentItems(selectedType),
                selectedBrigade
                    ? fetchEquipmentAvailability({ brigadeId: selectedBrigade, vehicleTypeId: selectedType })
                    : Promise.resolve([]),
            ])
            setItems(itemsData)
            setAvailability(availData)
        } catch (err) {
            console.error('Failed to load data:', err)
        } finally {
            setLoading(false)
        }
    }

    // ── Helpers ─────────────────────────────────────
    const getAvail = (itemId) => {
        return availability.find(a => a.equipmentItemId === itemId) || null
    }

    // ── Vehicle Type CRUD ───────────────────────────
    const handleAddType = async () => {
        if (!newTypeName.trim()) return
        try {
            await createVehicleType({ name: newTypeName.trim() })
            setNewTypeName('')
            toast.success('Тип додано')
            loadVehicleTypes()
        } catch (err) {
            toast.error('Помилка при додаванні типу')
        }
    }

    const handleDeleteType = async (id) => {
        if (!confirm('Видалити тип автомобіля та всі пов\'язані дані?')) return
        try {
            await deleteVehicleType(id)
            toast.success('Тип видалено')
            if (selectedType === id) setSelectedType('')
            loadVehicleTypes()
        } catch (err) {
            toast.error('Помилка при видаленні типу')
        }
    }

    // ── Equipment Item CRUD ─────────────────────────
    const handleAddItem = async () => {
        if (!newItemName.trim() || !selectedType) return
        try {
            await createEquipmentItem({
                name: newItemName.trim(),
                norm: Number(newItemNorm) || 0,
                brigadeNorm: Number(newItemBrigadeNorm) || 0,
                vehicleTypeId: selectedType,
            })
            setNewItemName('')
            setNewItemNorm('')
            setNewItemBrigadeNorm('')
            toast.success('Позицію додано')
            loadData()
        } catch (err) {
            toast.error('Помилка при додаванні позиції')
        }
    }

    const handleDeleteItem = async (id) => {
        if (!confirm('Видалити цю позицію?')) return
        try {
            await deleteEquipmentItem(id)
            toast.success('Позицію видалено')
            loadData()
        } catch (err) {
            toast.error('Помилка при видаленні позиції')
        }
    }

    // ── Availability CRUD ───────────────────────────
    const handleAvailChange = async (itemId, field, value) => {
        const existing = getAvail(itemId)
        const numVal = Number(value) || 0

        try {
            if (existing) {
                await updateEquipmentAvailability(existing.id, { [field]: numVal })
            } else {
                await createEquipmentAvailability({
                    equipmentItemId: itemId,
                    brigadeId: selectedBrigade,
                    [field]: numVal,
                })
            }
            loadData()
        } catch (err) {
            toast.error('Помилка при збереженні даних')
        }
    }

    if (!selectedBrigade) {
        return <p style={{ padding: '2rem', textAlign: 'center' }}>Оберіть частину для перегляду потреби</p>
    }

    return (
        <div className="gr-page">
            <h2 className="gd-title-wrapp">Потреба ПТО та АРО</h2>

            {/* ── Vehicle Type Selector ── */}
            <div className="gr-select-wrapp">
                <div className="gr-type-selector">
                    <span>Оберіть тип автомобіля:</span>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(Number(e.target.value))}
                    >
                        <option value="">—</option>
                        {vehicleTypes.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>

                {isGod && (
                    <div className="gr-type-add">
                        <input
                            type="text"
                            value={newTypeName}
                            onChange={(e) => setNewTypeName(e.target.value)}
                            placeholder="Новий тип..."
                            onKeyDown={(e) => e.key === 'Enter' && handleAddType()}
                        />
                        <button className="gr-btn-add" onClick={handleAddType} title="Додати тип">
                            <MdAdd size={20} />
                        </button>
                    </div>
                )}

                {isGod && selectedType && (
                    <button
                        className="gr-btn-delete-type"
                        onClick={() => handleDeleteType(selectedType)}
                        title="Видалити обраний тип"
                    >
                        <MdDelete size={18} /> Видалити тип
                    </button>
                )}
            </div>

            {loading ? (
                <LoadingSpinner />
            ) : (
                <>
                    {/* ── Table ── */}
                    <div className="gr-table-wrapper">
                        <div className="gr-content-title">
                            <span>№</span>
                            <span>Найменування</span>
                            <span>Згідно норм</span>
                            <span>В наявності</span>
                            <span>Не комплект</span>
                            <span>Резерв (норма)</span>
                            <span>Резерв (наявн.)</span>
                            <span>Не комплект</span>
                            <span>Загальна потреба</span>
                            {isGod && <span>Дії</span>}
                        </div>

                        {items.map((item, index) => {
                            const avail = getAvail(item.id)
                            const vehicleCount = avail?.vehicleCount || 0
                            const available = avail?.available || 0

                            // Calculated fields
                            const need = item.norm * vehicleCount
                            const shortage = need - available
                            const reserveNeed = item.brigadeNorm
                            const reserveAvail = avail?.reserveAvailable || 0
                            const reserveShortage = reserveNeed - reserveAvail
                            const totalNeed = Math.max(0, shortage) + Math.max(0, reserveShortage)

                            return (
                                <div key={item.id} className="gr-content-row">
                                    <span>{index + 1}</span>
                                    <span className="gr-item-name">{item.name}</span>
                                    <span>{need}</span>
                                    <span>
                                        {(isRW || isGod) ? (
                                            <input
                                                type="number"
                                                min="0"
                                                className="gr-input"
                                                value={available || ''}
                                                onChange={(e) => handleAvailChange(item.id, 'available', e.target.value)}
                                            />
                                        ) : available}
                                    </span>
                                    <span className={shortage > 0 ? 'gr-shortage' : ''}>{shortage > 0 ? shortage : '—'}</span>
                                    <span>{reserveNeed}</span>
                                    <span>
                                        {(isRW || isGod) ? (
                                            <input
                                                type="number"
                                                min="0"
                                                className="gr-input"
                                                value={reserveAvail || ''}
                                                onChange={(e) => handleAvailChange(item.id, 'reserveAvailable', e.target.value)}
                                            />
                                        ) : reserveAvail}
                                    </span>
                                    <span className={reserveShortage > 0 ? 'gr-shortage' : ''}>{reserveShortage > 0 ? reserveShortage : '—'}</span>
                                    <span className={totalNeed > 0 ? 'gr-total-need' : ''}>{totalNeed > 0 ? totalNeed : '—'}</span>
                                    {isGod && (
                                        <span>
                                            <button className="delete-btn" onClick={() => handleDeleteItem(item.id)} title="Видалити">
                                                <MdDelete size={18} />
                                            </button>
                                        </span>
                                    )}
                                </div>
                            )
                        })}

                        {items.length === 0 && (
                            <div className="gr-empty">Для цього типу ще немає позицій</div>
                        )}
                    </div>

                    {/* ── Vehicle count editor ── */}
                    {(isRW || isGod) && selectedType && (
                        <div className="gr-vehicle-count">
                            <label>Кількість автомобілів цього типу в частині:</label>
                            <input
                                type="number"
                                min="0"
                                className="gr-input"
                                value={items.length > 0 ? (getAvail(items[0]?.id)?.vehicleCount || '') : ''}
                                onChange={(e) => {
                                    // Update vehicleCount for all items in this type
                                    items.forEach(item => {
                                        handleAvailChange(item.id, 'vehicleCount', e.target.value)
                                    })
                                }}
                            />
                        </div>
                    )}

                    {/* ── Add new item (GOD only) ── */}
                    {isGod && selectedType && (
                        <div className="gr-add-item">
                            <h4>Додати позицію</h4>
                            <div className="gr-add-item-form">
                                <input
                                    type="text"
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    placeholder="Назва обладнання"
                                />
                                <input
                                    type="number"
                                    value={newItemNorm}
                                    onChange={(e) => setNewItemNorm(e.target.value)}
                                    placeholder="Норма на 1 авто"
                                    min="0"
                                />
                                <input
                                    type="number"
                                    value={newItemBrigadeNorm}
                                    onChange={(e) => setNewItemBrigadeNorm(e.target.value)}
                                    placeholder="Резерв (норма)"
                                    min="0"
                                />
                                <button className="gr-btn-add" onClick={handleAddItem}>
                                    <MdAdd size={20} /> Додати
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default GeneralRequirements