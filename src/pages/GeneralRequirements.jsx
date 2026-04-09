import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { toast } from 'react-toastify'
import {
    fetchVehicleTypes,
    createVehicleType,
    updateVehicleType,
    deleteVehicleType,
    fetchEquipmentItems,
    createEquipmentItem,
    updateEquipmentItem,
    deleteEquipmentItem,
    fetchEquipmentAvailability,
    createEquipmentAvailability,
    updateEquipmentAvailability,
    fetchTransferBrigades,
} from '../api/services.js'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
import { MdDelete, MdAdd, MdEdit, MdCheck, MdSearch } from 'react-icons/md'
import '../scss/generalrequirements.scss'

const GeneralRequirements = ({ selectedBrigade }) => {
    const { user } = useAuth()
    const isGod = user?.role === 'GOD'
    const isSemiGod = user?.role === 'SEMI-GOD'
    const isRW = user?.role === 'RW'

    const [vehicleTypes, setVehicleTypes] = useState([])
    const [selectedType, setSelectedType] = useState('')
    const [items, setItems] = useState([])
    const [availability, setAvailability] = useState([])
    const [loading, setLoading] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Summary state
    const [showSummaryModal, setShowSummaryModal] = useState(false)
    const [summaryLoading, setSummaryLoading] = useState(false)
    const [summaryData, setSummaryData] = useState([])
    const [rawSummaryData, setRawSummaryData] = useState([])
    const [availableDetachments, setAvailableDetachments] = useState([])
    const [selectedSummaryDetachment, setSelectedSummaryDetachment] = useState('')

    // New vehicle type form
    const [newTypeName, setNewTypeName] = useState('')
    const [newTypeVehicleCount, setNewTypeVehicleCount] = useState('')

    // New equipment item form
    const [newItemName, setNewItemName] = useState('')
    const [newItemPerVehicle, setNewItemPerVehicle] = useState('')
    const [newItemRequiredRule, setNewItemRequiredRule] = useState('exact')
    const [newItemWarehouseRequired, setNewItemWarehouseRequired] = useState('')
    const [newItemWarehouseRule, setNewItemWarehouseRule] = useState('exact')
    const [newItemWarehousePercent, setNewItemWarehousePercent] = useState('')

    // ── Summary Logic ───────────────────────────────
    const buildMatrix = (data, detachmentFilter, allItems, allDetachments) => {
        const itemsMap = new Map()
        
        // Pre-seed all items
        if (allItems) {
            allItems.forEach(item => {
                let itemName = item.name
                const vTypeName = item.VehicleType?.name
                if (vTypeName) itemName += ` (${vTypeName})`
                if (!itemsMap.has(item.id)) itemsMap.set(item.id, itemName)
            })
        }

        const regionsSet = new Set()

        // Pre-seed all regions
        if (allDetachments) {
            if (isGod && !detachmentFilter) {
                allDetachments.forEach(d => regionsSet.add(d.name))
            } else {
                let targetDetachment = null
                if (isGod && detachmentFilter) {
                    targetDetachment = allDetachments.find(d => d.name === detachmentFilter)
                } else if (isSemiGod) {
                    targetDetachment = allDetachments.find(d => d.Brigades.some(b => b.id === user?.brigadeId))
                }
                
                if (targetDetachment) {
                    targetDetachment.Brigades.forEach(b => regionsSet.add(b.name))
                }
            }
        }

        const matrix = {}

        data.forEach(d => {
            const dName = d.Brigade?.Detachment?.name || 'Інше'
            if (isGod && detachmentFilter && dName !== detachmentFilter) return

            if (!d.EquipmentItem) return
            const itemId = d.EquipmentItem.id
            
            // If item wasn't caught by pre-seed
            if (!itemsMap.has(itemId)) {
                let itemName = d.EquipmentItem.name
                const vTypeName = d.EquipmentItem.VehicleType?.name
                if (vTypeName) itemName += ` (${vTypeName})`
                itemsMap.set(itemId, itemName)
            }
            
            if (!matrix[itemId]) matrix[itemId] = {}

            let regionName = 'Інше'
            if (isGod && !detachmentFilter) {
                regionName = dName
            } else {
                regionName = d.Brigade?.name || 'Інше'
            }
            
            regionsSet.add(regionName)
            if (!matrix[itemId][regionName]) matrix[itemId][regionName] = 0
            matrix[itemId][regionName] += (d.total_need || 0)
        })

        const columns = Array.from(regionsSet).sort()
        const rowsData = []

        for (const [itemId, itemName] of itemsMap.entries()) {
            const row = { id: itemId, name: itemName, total: 0 }
            columns.forEach(col => {
                const val = (matrix[itemId] && matrix[itemId][col]) || 0
                row[col] = val
                row.total += val
            })
            rowsData.push(row)
        }

        rowsData.sort((a,b) => a.name.localeCompare(b.name))

        const colTotals = { total: 0 }
        columns.forEach(c => colTotals[c] = 0)
        rowsData.forEach(r => {
            columns.forEach(c => {
                colTotals[c] += r[c]
            })
            colTotals.total += r.total
        })

        setSummaryData({ columns, rows: rowsData, colTotals })
    }

    const [fullItemsCache, setFullItemsCache] = useState(null)
    const [fullDetachmentsCache, setFullDetachmentsCache] = useState(null)

    const handleShowSummary = async () => {
        setSummaryLoading(true)
        setShowSummaryModal(true)
        try {
            const params = {}
            if (selectedType) params.vehicleTypeId = selectedType
            
            const [data, allItems, allDetachments] = await Promise.all([
                fetchEquipmentAvailability(params),
                fetchEquipmentItems(selectedType || undefined),
                fetchTransferBrigades()
            ])
            
            setRawSummaryData(data)
            setFullItemsCache(allItems)
            setFullDetachmentsCache(allDetachments)
            
            if (isGod) {
                setAvailableDetachments(allDetachments.map(d => d.name).sort())
            }
            
            buildMatrix(data, selectedSummaryDetachment, allItems, allDetachments)
        } catch (err) {
            console.error(err)
            toast.error('Помилка завантаження зведення')
            setShowSummaryModal(false)
        } finally {
            setSummaryLoading(false)
        }
    }

    useEffect(() => {
        if (showSummaryModal && rawSummaryData.length > 0) {
            buildMatrix(rawSummaryData, selectedSummaryDetachment, fullItemsCache, fullDetachmentsCache)
        }
    }, [selectedSummaryDetachment])

    // ── Load vehicle types ──────────────────────────
    useEffect(() => {
        loadVehicleTypes()
    }, [selectedBrigade])

    const loadVehicleTypes = async () => {
        try {
            const data = await fetchVehicleTypes(selectedBrigade || undefined)
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
        if (showSummaryModal) {
            handleShowSummary()
        } else {
            loadData()
        }
    }, [selectedType, selectedBrigade])

    const loadData = async () => {
        setLoading(true)
        try {
            const itemsData = await fetchEquipmentItems(selectedType, selectedBrigade)
            setItems(itemsData)
        } catch (err) {
            console.error('Failed to load data:', err)
        } finally {
            setLoading(false)
        }
    }

    // ── Helpers ─────────────────────────────────────

    const getVehicleCount = () => {
        const vt = vehicleTypes.find(t => t.id === selectedType)
        return vt?.viechle_count || 0
    }

    // ── Vehicle Type CRUD ───────────────────────────
    const handleAddType = async () => {
        if (!newTypeName.trim()) return
        if (!selectedBrigade) {
            toast.error('Оберіть частину')
            return
        }
        try {
            await createVehicleType({
                name: newTypeName.trim(),
            })
            setNewTypeName('')
            setNewTypeVehicleCount('')
            toast.success('Тип додано')
            loadVehicleTypes()
        } catch (err) {
            toast.error('Помилка при додаванні типу')
        }
    }

    const handleUpdateVehicleCount = async (value) => {
        if (!selectedType) return
        try {
            await updateVehicleType(selectedType, { viechle_count: Number(value) || 0, brigadeId: selectedBrigade })
            loadVehicleTypes()
        } catch (err) {
            toast.error('Помилка при оновленні кількості авто')
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
                required_per_vehicle: Number(newItemPerVehicle) || 0,
                required_rule: newItemRequiredRule,
                warehouse_required: Number(newItemWarehouseRequired) || 0,
                warehouse_rule: newItemWarehouseRule,
                warehouse_percent: newItemWarehouseRule === 'percent_of_actual' ? (Number(newItemWarehousePercent) || 0) : null,
                vehicleTypeId: selectedType,
            })
            setNewItemName('')
            setNewItemPerVehicle('')
            setNewItemRequiredRule('exact')
            setNewItemWarehouseRequired('')
            setNewItemWarehouseRule('exact')
            setNewItemWarehousePercent('')
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

    // ── Inline field update for EquipmentItem ───────
    const handleItemFieldChange = async (itemId, field, value, totalNeedValue) => {
        try {
            const payload = { [field]: value, brigadeId: selectedBrigade }
            if (totalNeedValue !== undefined) {
                payload.total_need = totalNeedValue
            }
            await updateEquipmentItem(itemId, payload)
            loadData()
        } catch (err) {
            toast.error('Помилка при оновленні')
        }
    }

    // ── End of CRUD ─────────────────────────────────

    const vehicleCount = selectedBrigade ? getVehicleCount() : 0

    return (
        <div className="gr-page">
            <div style={{ width: '100%', marginBottom: '1.5rem', paddingBottom: '0.5rem', paddingTop: '0.5rem', borderRadius: '6px', textAlign: 'center' }}>
                <h2 className="gd-title-wrapp" style={{ margin: 0, padding: '1rem 0', color: 'var(--navy)'}}>Потреба ПТО та АРО</h2>
            </div>

            {!selectedBrigade && !showSummaryModal ? (
                <p style={{ padding: '3rem', textAlign: 'center', fontSize: '1.2rem', color: '#7f8c8d' }}>Оберіть частину для перегляду потреби</p>
            ) : (
            <>
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

                {isGod && isEditing && (
                    <div className="gr-type-add">
                        <input
                            type="text"
                            value={newTypeName}
                            onChange={(e) => setNewTypeName(e.target.value)}
                            placeholder="Новий тип..."
                            onKeyDown={(e) => e.key === 'Enter' && handleAddType()}
                        />
                        <input
                            type="number"
                            value={newTypeVehicleCount}
                            onChange={(e) => setNewTypeVehicleCount(e.target.value)}
                            placeholder="К-сть авто"
                            min="0"
                            className="gr-input-small"
                        />
                        <button className="gr-btn-add" onClick={handleAddType} title="Додати тип">
                            <span>Додати тип</span>
                        </button>
                    </div>
                )}

                {isGod && selectedType && isEditing && (
                    <button
                        className="gr-btn-delete-type"
                        onClick={() => handleDeleteType(selectedType)}
                        title="Видалити обраний тип"
                    >
                        <span>Видалити тип</span>
                    </button>
                )}

                {/* ── Vehicle count editor ── */}
                {(isRW || isGod) && selectedType && (
                    <div className="gr-vehicle-count">
                        <label>Кількість автомобілів:
                        <input
                            type="number"
                            min="0"
                            className="gr-input"
                            value={vehicleCount || ''}
                            onChange={(e) => handleUpdateVehicleCount(e.target.value)}
                            disabled={!isEditing}
                        />
                        </label>
                    </div>
                )}
                {(isRW || isGod) && (
                    <button className="gr-btn-edit-toggle" onClick={() => setIsEditing(!isEditing)} title={isEditing ? "Завершити редагування" : "Редагувати"}>
                        {isEditing ? <MdCheck size={20} /> : <MdEdit size={20} />}
                    </button>
                )}
            </div>

            {/* ── Search ── */}
            {(selectedType || showSummaryModal) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                    <div className="gr-search" style={{ flex: 1, margin: 0 }}>
                        <MdSearch size={18} />
                        <input
                            type="text"
                            placeholder="Пошук за найменуванням..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {isGod && showSummaryModal && (
                        <select
                            style={{ padding: '0.45rem 1rem', fontSize: '0.95rem', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius-md)', color: 'var(--navy)', fontWeight: 'bold', outline: 'none', cursor: 'pointer', minWidth: '200px' }}
                            value={selectedSummaryDetachment}
                            onChange={(e) => setSelectedSummaryDetachment(e.target.value)}
                        >
                            <option value="">Всі загони</option>
                            {availableDetachments.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    )}
                    {(isGod || isSemiGod) && (
                        <button 
                            style={{ padding: '0.5rem 1.5rem', fontSize: '0.95rem', background: 'var(--navy)', color: 'white', border: '1px solid var(--gold)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' }} 
                            onMouseEnter={(e)=> { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = 'var(--navy)'; }}
                            onMouseLeave={(e)=> { e.currentTarget.style.background = 'var(--navy)'; e.currentTarget.style.color = 'white'; }}
                            onClick={() => {
                                if (showSummaryModal) setShowSummaryModal(false)
                                else handleShowSummary()
                            }}
                        >
                            {showSummaryModal ? 'Сховати зведення' : 'Зведення потреб'}
                        </button>
                    )}
                </div>
            )}

            {loading || summaryLoading ? (
                <div style={{textAlign: 'center', padding: '2rem'}}><LoadingSpinner /></div>
            ) : showSummaryModal ? (
                <div className="gr-table-wrapper" style={{ minWidth: '100%' }}>
                    <div style={{ minWidth: `${(summaryData?.columns?.length || 0) * 120 + 400}px` }}>
                        <div className="gr-content-title" style={{ gridTemplateColumns: `0.4fr 3.5fr ${summaryData?.columns?.map(() => 'minmax(100px, 1.5fr)').join(' ')} 0.8fr` }}>
                            <span>№</span>
                        <span>Найменування</span>
                        {summaryData?.columns?.map(c => <span key={c}>{c}</span>)}
                        <span>Загальна потреба</span>
                    </div>

                    {summaryData?.rows?.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase())).map((row, index) => (
                        <div key={row.id} className="gr-content-row" style={{ gridTemplateColumns: `0.4fr 3.5fr ${summaryData?.columns?.map(() => 'minmax(100px, 1.5fr)').join(' ')} 0.8fr` }}>
                            <span>{index + 1}</span>
                            <span className="gr-item-name">{row.name}</span>
                            {summaryData?.columns?.map(c => <span key={c}>{row[c] || 0}</span>)}
                            <span className="gr-total-need">{row.total}</span>
                        </div>
                    ))}

                    {summaryData?.rows?.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                        <div className="gr-empty">Немає даних</div>
                    )}

                    {summaryData?.rows?.length > 0 && (
                        <div className="gr-content-row" style={{ gridTemplateColumns: `0.4fr 3.5fr ${summaryData?.columns?.map(() => 'minmax(100px, 1.5fr)').join(' ')} 0.8fr`, background: 'var(--gray-50)', fontWeight: 'bold' }}>
                            <span></span>
                            <span className="gr-item-name">Всього</span>
                            {summaryData?.columns?.map(c => <span key={c}>{summaryData?.colTotals?.[c] || 0}</span>)}
                            <span className="gr-total-need">{summaryData?.colTotals?.total || 0}</span>
                        </div>
                    )}
                    </div>
                </div>
            ) : (
                <>
                    {/* ── Table ── */}
                    <div className="gr-table-wrapper">
                        <div className="gr-content-title">
                            <span>№</span>
                            <span>Найменування</span>
                            <span>Норма на одиницю техніки</span>
                         
                            <span>В наявності</span>
                            <span>Не комплект</span>
                            <span>Резерв (норма)</span>
                            <span>Резерв (наявн.)</span>
                            <span>Не комплект</span>
                            <span>Загальна потреба</span>
                            {isGod && isEditing && <span>Дії</span>}
                        </div>

                        {items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())).map((item, index) => {
                            // Vehicle equipment calculation
                            const reqPerVehicle = item.required_per_vehicle || 0
                            const totalRequired = reqPerVehicle * vehicleCount
                            const actualCount = item.actual_count || 0
                            const vehicleShortage = totalRequired - actualCount

                            // Warehouse calculation
                            const warehouseRequired = item.warehouse_required || 0
                            const warehousePercent = item.warehouse_percent || 0
                            
                            let calculatedWarehouseNorm = warehouseRequired
                            if (item.warehouse_rule === 'percent_of_actual' && item.warehouse_percent) {
                                calculatedWarehouseNorm = Math.ceil(actualCount * (item.warehouse_percent / 100))
                            }
                            const warehouseActual = item.warehouse_actual || 0
                            const warehouseShortage = calculatedWarehouseNorm - warehouseActual

                            const totalNeed = Math.max(0, vehicleShortage) + Math.max(0, warehouseShortage)

                            return (
                                <div key={item.id} className="gr-content-row">
                                    <span>{index + 1}</span>
                                    <span className="gr-item-name">{item.name}</span>
                                    <span>
                                        {isGod && isEditing ? (
                                            <input
                                                type="number"
                                                min="0"
                                                className="gr-input"
                                                value={reqPerVehicle || ''}
                                                onBlur={(e) => handleItemFieldChange(item.id, 'required_per_vehicle', Number(e.target.value) || 0, totalNeed)}
                                                onChange={(e) => {
                                                    const newItems = items.map(i => i.id === item.id ? { ...i, required_per_vehicle: Number(e.target.value) || 0 } : i)
                                                    setItems(newItems)
                                                }}
                                            />
                                        ) : (
                                            item.required_rule === 'min' ? `не менше ${reqPerVehicle}` : reqPerVehicle
                                        )}
                                    </span>
                                  
                                    <span>
                                        {(isRW || isGod) && isEditing ? (
                                            <input
                                                type="number"
                                                min="0"
                                                className="gr-input"
                                                value={actualCount || ''}
                                                onBlur={(e) => handleItemFieldChange(item.id, 'actual_count', Number(e.target.value) || 0, totalNeed)}
                                                onChange={(e) => {
                                                    const newItems = items.map(i => i.id === item.id ? { ...i, actual_count: Number(e.target.value) || 0 } : i)
                                                    setItems(newItems)
                                                }}
                                            />
                                        ) : actualCount}
                                    </span>
                                    <span className={vehicleShortage > 0 ? 'gr-shortage' : ''}>{vehicleShortage > 0 ? vehicleShortage : '—'}</span>
                                    <span>
                                        {isGod && isEditing ? (
                                            <input
                                                type="number"
                                                min="0"
                                                className="gr-input"
                                                value={item.warehouse_rule === 'percent_of_actual' ? (warehousePercent || '') : (warehouseRequired || '')}
                                                onBlur={(e) => {
                                                    const field = item.warehouse_rule === 'percent_of_actual' ? 'warehouse_percent' : 'warehouse_required'
                                                    handleItemFieldChange(item.id, field, Number(e.target.value) || 0, totalNeed)
                                                }}
                                                onChange={(e) => {
                                                    const field = item.warehouse_rule === 'percent_of_actual' ? 'warehouse_percent' : 'warehouse_required'
                                                    const newItems = items.map(i => i.id === item.id ? { ...i, [field]: Number(e.target.value) || 0 } : i)
                                                    setItems(newItems)
                                                }}
                                            />
                                        ) : (
                                            item.warehouse_rule === 'percent_of_actual' ? `${warehousePercent}%` : 
                                            item.warehouse_rule === 'min' ? `не менше ${warehouseRequired}` : warehouseRequired
                                        )}
                                    </span>
                                    <span>
                                        {(isRW || isGod) && isEditing ? (
                                            <input
                                                type="number"
                                                min="0"
                                                className="gr-input"
                                                value={warehouseActual || ''}
                                                onBlur={(e) => handleItemFieldChange(item.id, 'warehouse_actual', Number(e.target.value) || 0, totalNeed)}
                                                onChange={(e) => {
                                                    const newItems = items.map(i => i.id === item.id ? { ...i, warehouse_actual: Number(e.target.value) || 0 } : i)
                                                    setItems(newItems)
                                                }}
                                            />
                                        ) : warehouseActual}
                                    </span>
                                    <span className={warehouseShortage > 0 ? 'gr-shortage' : ''}>{warehouseShortage > 0 ? warehouseShortage : '—'}</span>
                                    <span className={totalNeed > 0 ? 'gr-total-need' : ''}>{totalNeed > 0 ? totalNeed : '—'}</span>
                                    {isGod && isEditing && (
                                        <span>
                                            <button className="gr-delete-btn" onClick={() => handleDeleteItem(item.id)} title="Видалити">
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


                    {/* ── Add new item (GOD only) ── */}
                    {isGod && selectedType && isEditing && (
                        <div className="gr-add-item">
                            <h4>Додати нову позицію для цього типу</h4>
                            <div className="gr-add-form">
                                <input
                                    type="text"
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    placeholder="Назва обладнання"
                                />
                                <input
                                    type="number"
                                    value={newItemPerVehicle}
                                    onChange={(e) => setNewItemPerVehicle(e.target.value)}
                                    placeholder="Норма на 1 авто"
                                    min="0"
                                />
                                <select
                                    value={newItemRequiredRule}
                                    onChange={(e) => setNewItemRequiredRule(e.target.value)}
                                    className="gr-select-rule"
                                >
                                    <option value="exact">Точно</option>
                                    <option value="min">Мінімум</option>
                                </select>
                                <input
                                    type="number"
                                    value={newItemWarehouseRequired}
                                    onChange={(e) => setNewItemWarehouseRequired(e.target.value)}
                                    placeholder="Резерв (норма)"
                                    min="0"
                                />
                                <select
                                    value={newItemWarehouseRule}
                                    onChange={(e) => setNewItemWarehouseRule(e.target.value)}
                                    className="gr-select-rule"
                                >
                                    <option value="exact">Точно</option>
                                    <option value="min">Мінімум</option>
                                    <option value="percent_of_actual">% від наявного</option>
                                </select>
                                {newItemWarehouseRule === 'percent_of_actual' && (
                                    <input
                                        type="number"
                                        value={newItemWarehousePercent}
                                        onChange={(e) => setNewItemWarehousePercent(e.target.value)}
                                        placeholder="%"
                                        min="0"
                                        max="100"
                                        className="gr-input-small"
                                    />
                                )}
                                <button className="gr-btn-add" onClick={handleAddItem}>
                                    <MdAdd size={20} /> Додати
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
            </>
            )}
        </div>
    )
}

export default GeneralRequirements