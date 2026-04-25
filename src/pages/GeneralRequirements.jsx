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
import { TfiPrinter } from 'react-icons/tfi'
import html2pdf from 'html2pdf.js'
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
    const [newTypeCloneFromId, setNewTypeCloneFromId] = useState('')

    // New equipment item form
    const [newItemName, setNewItemName] = useState('')
    const [newItemPerVehicle, setNewItemPerVehicle] = useState('')
    const [newItemRequiredRule, setNewItemRequiredRule] = useState('exact')
    const [newItemWarehouseRequired, setNewItemWarehouseRequired] = useState('')
    const [newItemWarehouseRule, setNewItemWarehouseRule] = useState('exact')
    const [newItemWarehousePercent, setNewItemWarehousePercent] = useState('')

    // ── Add-type modal ──
    const [showAddTypeModal, setShowAddTypeModal] = useState(false)
    const [isCreatingType, setIsCreatingType] = useState(false)

    // ── PDF Export ─────────────────────────────────
    const exportSummaryToPdf = () => {
        if (!summaryData?.rows?.length) return

        const cols = summaryData.columns || []
        const rows = summaryData.rows || []
        const totals = summaryData.colTotals || {}
        const vType = vehicleTypes.find(t => t.id === Number(selectedType))
        const typeName = vType?.name || ''
        const detName = selectedSummaryDetachment || 'Всі загони'
        const today = new Date().toLocaleDateString('uk-UA')

        const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1a1a2e;">
            <h2 style="text-align: center; margin-bottom: 4px;">Зведення потреб ПТО та АРО</h2>
            <p style="text-align: center; margin: 0 0 2px; font-size: 13px; color: #555;">${typeName ? 'Тип техніки: ' + typeName : 'Всі типи техніки'}</p>
            <p style="text-align: center; margin: 0 0 2px; font-size: 13px; color: #555;">Загін: ${detName}</p>
            <p style="text-align: center; margin: 0 0 14px; font-size: 12px; color: #888;">Станом на: ${today}</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                <thead>
                    <tr style="background: #1a1a2e; color: white;">
                        <th style="border: 1px solid #333; padding: 6px 4px; width: 30px;">№</th>
                        <th style="border: 1px solid #333; padding: 6px 4px; text-align: left;">Найменування</th>
                        ${cols.map(c => `<th style="border: 1px solid #333; padding: 6px 4px; text-align: center;">${c}</th>`).join('')}
                        <th style="border: 1px solid #333; padding: 6px 4px; text-align: center; background: #2d2d5e;">Загальна потреба</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.map((row, i) => `
                        <tr style="background: ${i % 2 === 0 ? '#fff' : '#f5f5fa'};">
                            <td style="border: 1px solid #ccc; padding: 5px 4px; text-align: center;">${i + 1}</td>
                            <td style="border: 1px solid #ccc; padding: 5px 6px; font-weight: 500;">${row.name}</td>
                            ${cols.map(c => `<td style="border: 1px solid #ccc; padding: 5px 4px; text-align: center;">${row[c] || 0}</td>`).join('')}
                            <td style="border: 1px solid #ccc; padding: 5px 4px; text-align: center; font-weight: 700; color: ${row.total > 0 ? '#b91c1c' : '#1a1a2e'};">${row.total}</td>
                        </tr>
                    `).join('')}
                    <tr style="background: #e8e8f0; font-weight: 700;">
                        <td style="border: 1px solid #999; padding: 6px 4px;"></td>
                        <td style="border: 1px solid #999; padding: 6px 6px;">Всього</td>
                        ${cols.map(c => `<td style="border: 1px solid #999; padding: 6px 4px; text-align: center;">${totals[c] || 0}</td>`).join('')}
                        <td style="border: 1px solid #999; padding: 6px 4px; text-align: center; color: #b91c1c;">${totals.total || 0}</td>
                    </tr>
                </tbody>
            </table>
        </div>`

        const container = document.createElement('div')
        container.innerHTML = html
        document.body.appendChild(container)

        html2pdf()
            .set({
                margin: [0.3, 0.2, 0.3, 0.2],
                filename: `Зведення_потреби_${typeName || 'всі'}_${today}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
            })
            .from(container)
            .outputPdf('bloburl')
            .then((url) => {
                document.body.removeChild(container)
                window.open(url, '_blank')
            })
    }

    // ── PDF Export (brigade table) ─────────────────────
    // --- print pdf in title will print brigade name only if user has logined ONLY FOR RW//
    const exportBrigadeTableToPdf = () => {
        if (!items.length || !selectedType) return
        const brigadeName = user?.brigadeName || ''
        const vType = vehicleTypes.find(t => t.id === Number(selectedType))
        const typeName = vType?.name || ''
        const today = new Date().toLocaleDateString('uk-UA')

        const tableRows = items.map((item, i) => {
            const reqPerVehicle = item.required_per_vehicle || 0
            const totalRequired = reqPerVehicle * vehicleCount
            const actualCount = item.actual_count || 0
            const vehicleShortage = totalRequired - actualCount

            const warehouseRequired = item.warehouse_required || 0
            let calculatedWarehouseNorm = warehouseRequired
            if (item.warehouse_rule === 'percent_of_actual' && item.warehouse_percent) {
                calculatedWarehouseNorm = Math.ceil(actualCount * (item.warehouse_percent / 100))
            }
            const warehouseActual = item.warehouse_actual || 0
            const warehouseShortage = calculatedWarehouseNorm - warehouseActual
            const totalNeed = Math.max(0, vehicleShortage) + Math.max(0, warehouseShortage)

            const normDisplay = item.required_rule === 'tu' ? '\u0412\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u043d\u043e \u0434\u043e \u0422\u0423' :
                item.required_rule === 'min' ? `\u043d\u0435 \u043c\u0435\u043d\u0448\u0435 ${reqPerVehicle}` : reqPerVehicle

            const whNormDisplay = item.warehouse_rule === 'percent_of_actual' ? `${item.warehouse_percent}%` :
                item.warehouse_rule === 'min' ? `\u043d\u0435 \u043c\u0435\u043d\u0448\u0435 ${warehouseRequired}` : warehouseRequired

            return `
                <tr style="background: ${i % 2 === 0 ? '#fff' : '#f5f5fa'};">
                    <td style="border: 1px solid #ccc; padding: 5px 4px; text-align: center;">${i + 1}</td>
                    <td style="border: 1px solid #ccc; padding: 5px 6px; font-weight: 500;">${item.name}</td>
                    <td style="border: 1px solid #ccc; padding: 5px 4px; text-align: center;">${normDisplay}</td>
                    <td style="border: 1px solid #ccc; padding: 5px 4px; text-align: center;">${actualCount}</td>
                    <td style="border: 1px solid #ccc; padding: 5px 4px; text-align: center; color: ${vehicleShortage > 0 ? '#b91c1c' : 'inherit'};">${vehicleShortage > 0 ? vehicleShortage : '\u2014'}</td>
                    <td style="border: 1px solid #ccc; padding: 5px 4px; text-align: center;">${whNormDisplay}</td>
                    <td style="border: 1px solid #ccc; padding: 5px 4px; text-align: center;">${warehouseActual}</td>
                    <td style="border: 1px solid #ccc; padding: 5px 4px; text-align: center; color: ${warehouseShortage > 0 ? '#b91c1c' : 'inherit'};">${warehouseShortage > 0 ? warehouseShortage : '\u2014'}</td>
                    <td style="border: 1px solid #ccc; padding: 5px 4px; text-align: center; font-weight: 700; color: ${totalNeed > 0 ? '#b91c1c' : '#1a1a2e'};">${totalNeed > 0 ? totalNeed : '\u2014'}</td>
                </tr>`
        })

        const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1a1a2e;">
            <h2 style="text-align: center; margin-bottom: 4px;">\u0412\u0456\u0434\u043e\u043c\u0456\u0441\u0442\u044c \u043f\u043e\u0442\u0440\u0435\u0431\u0438 \u041f\u0422\u041e \u0442\u0430 \u0410\u0420\u041e</h2>
            <p style="text-align: center; margin: 0 0 2px; font-size: 13px; color: #555;">${brigadeName ? brigadeName + ' | ' : ''}\u0422\u0438\u043f \u0442\u0435\u0445\u043d\u0456\u043a\u0438: ${typeName} | \u041a\u0456\u043b\u044c\u043a\u0456\u0441\u0442\u044c \u0430\u0432\u0442\u043e: ${vehicleCount}</p>
            <p style="text-align: center; margin: 0 0 14px; font-size: 12px; color: #888;">\u0421\u0442\u0430\u043d\u043e\u043c \u043d\u0430: ${today}</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                <thead>
                    <tr style="background: #1a1a2e; color: white;">
                        <th style="border: 1px solid #333; padding: 6px 4px; width: 30px;">\u2116</th>
                        <th style="border: 1px solid #333; padding: 6px 4px; text-align: left;">\u041d\u0430\u0439\u043c\u0435\u043d\u0443\u0432\u0430\u043d\u043d\u044f</th>
                        <th style="border: 1px solid #333; padding: 6px 4px; text-align: center;">\u041d\u043e\u0440\u043c\u0430 \u043d\u0430 1 \u0430\u0432\u0442\u043e</th>
                        <th style="border: 1px solid #333; padding: 6px 4px; text-align: center;">\u0412 \u043d\u0430\u044f\u0432\u043d\u043e\u0441\u0442\u0456</th>
                        <th style="border: 1px solid #333; padding: 6px 4px; text-align: center;">\u041d\u0435 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442</th>
                        <th style="border: 1px solid #333; padding: 6px 4px; text-align: center;">\u0420\u0435\u0437\u0435\u0440\u0432 (\u043d\u043e\u0440\u043c\u0430)</th>
                        <th style="border: 1px solid #333; padding: 6px 4px; text-align: center;">\u0420\u0435\u0437\u0435\u0440\u0432 (\u043d\u0430\u044f\u0432\u043d.)</th>
                        <th style="border: 1px solid #333; padding: 6px 4px; text-align: center;">\u041d\u0435 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442</th>
                        <th style="border: 1px solid #333; padding: 6px 4px; text-align: center; background: #2d2d5e;">\u0417\u0430\u0433\u0430\u043b\u044c\u043d\u0430 \u043f\u043e\u0442\u0440\u0435\u0431\u0430</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows.join('')}
                </tbody>
            </table>
        </div>`

        const container = document.createElement('div')
        container.innerHTML = html
        document.body.appendChild(container)

        html2pdf()
            .set({
                margin: [0.3, 0.2, 0.3, 0.2],
                filename: `\u041f\u043e\u0442\u0440\u0435\u0431\u0438_${typeName}_${today}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
            })
            .from(container)
            .outputPdf('bloburl')
            .then((url) => {
                document.body.removeChild(container)
                window.open(url, '_blank')
            })
    }

    // ── Summary Logic ───────────────────────────────
    const buildMatrix = (data, detachmentFilter, allItems, allDetachments) => {
        // 2. Prepare items reference & fallback dictionary
        const itemsById = new Map()
        if (allItems) {
            allItems.forEach(item => {
                let itemName = item.name
                const vType = item.VehicleType?.name
                if (vType && !selectedType) itemName += ` (${vType})`
                itemsById.set(item.id, { ...item, _displayName: itemName })
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
            if (!itemsById.has(itemId)) {
                let itemName = d.EquipmentItem.name
                const vTypeName = d.EquipmentItem.VehicleType?.name
                if (vTypeName && !selectedType) itemName += ` (${vTypeName})`
                itemsById.set(itemId, { ...d.EquipmentItem, _displayName: itemName })
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

        for (const [itemId, item] of itemsById.entries()) {
            const row = { id: itemId, name: item._displayName, total: 0 }
            columns.forEach(col => {
                const val = (matrix[itemId] && matrix[itemId][col]) || 0
                row[col] = val
                row.total += val
            })
            rowsData.push(row)
        }

        rowsData.sort((a, b) => a.id - b.id)

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
    const handleAddType = async (e) => {
        if (e?.preventDefault) e.preventDefault()
        if (!newTypeName.trim()) return
        if (!selectedBrigade) {
            toast.error('Оберіть частину')
            return
        }
        setIsCreatingType(true)
        try {
            const payload = { name: newTypeName.trim() }
            if (newTypeCloneFromId) payload.cloneFromId = Number(newTypeCloneFromId)
            const created = await createVehicleType(payload)
            setNewTypeName('')
            setNewTypeVehicleCount('')
            setNewTypeCloneFromId('')
            setShowAddTypeModal(false)
            if (created?.clonedCount > 0) {
                toast.success(`Тип додано (клоновано позицій: ${created.clonedCount})`)
            } else {
                toast.success('Тип додано')
            }
            loadVehicleTypes()
        } catch (err) {
            toast.error('Помилка при додаванні типу')
        } finally {
            setIsCreatingType(false)
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
                <h2 className="gd-title-wrapp" style={{ margin: 0, padding: '1rem 0', color: 'var(--navy)' }}>Потреба ПТО та АРО</h2>
            </div>

            {showAddTypeModal && (
                <div
                    onClick={() => !isCreatingType && setShowAddTypeModal(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{ background: '#fff', borderRadius: '8px', width: '100%', maxWidth: '460px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', overflow: 'hidden' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid var(--gray-200, #e5e7eb)', background: 'var(--navy)', color: '#fff' }}>
                            <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Додати тип автомобіля</h3>
                            <button
                                type='button'
                                onClick={() => !isCreatingType && setShowAddTypeModal(false)}
                                style={{ background: 'transparent', color: '#fff', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleAddType} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.25rem' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--navy)', fontWeight: 600 }}>Новий тип</label>
                            <input
                                type='text'
                                autoFocus
                                value={newTypeName}
                                onChange={(e) => setNewTypeName(e.target.value)}
                                placeholder='напр. Автоцистерни'
                                style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--gray-300, #d1d5db)', borderRadius: '6px', fontSize: '0.95rem', outline: 'none' }}
                            />

                            <label style={{ fontSize: '0.9rem', color: 'var(--navy)', fontWeight: 600 }}>Створити на основі</label>
                            <select
                                value={newTypeCloneFromId}
                                onChange={(e) => setNewTypeCloneFromId(e.target.value)}
                                title='Позиції скопіюються з нульовими кількостями'
                                style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--gray-300, #d1d5db)', borderRadius: '6px', fontSize: '0.95rem', background: '#fff', outline: 'none' }}
                            >
                                <option value=''>— з порожньою таблицею —</option>
                                {vehicleTypes.map((t) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--gray-600, #6b7280)' }}>
                                Якщо обрано існуючий тип — позиції скопіюються з нульовими кількостями.
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <button
                                    type='button'
                                    onClick={() => setShowAddTypeModal(false)}
                                    disabled={isCreatingType}
                                    style={{ padding: '0.55rem 1rem', background: 'var(--gray-200, #e5e7eb)', color: 'var(--navy)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    Скасувати
                                </button>
                                <button
                                    type='submit'
                                    disabled={isCreatingType || !newTypeName.trim()}
                                    style={{ padding: '0.55rem 1.2rem', background: 'var(--navy)', color: '#fff', border: '1px solid var(--gold, #f5c842)', borderRadius: '6px', cursor: isCreatingType || !newTypeName.trim() ? 'not-allowed' : 'pointer', fontWeight: 700, opacity: isCreatingType || !newTypeName.trim() ? 0.6 : 1 }}
                                >
                                    {isCreatingType ? 'Створення...' : 'Створити'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                            <button
                                className="gr-btn-add"
                                onClick={() => {
                                    setNewTypeName('')
                                    setNewTypeCloneFromId('')
                                    setShowAddTypeModal(true)
                                }}
                                title="Додати тип"
                            >
                                <span>Додати тип</span>
                            </button>
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
                        <div className="gr-search-wrapper">
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
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = 'var(--navy)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--navy)'; e.currentTarget.style.color = 'white'; }}
                                    onClick={() => {
                                        if (showSummaryModal) setShowSummaryModal(false)
                                        else handleShowSummary()
                                    }}
                                >
                                    {showSummaryModal ? 'Сховати зведення' : 'Зведення потреби'}
                                </button>
                            )}
                            {showSummaryModal && summaryData?.rows?.length > 0 && (
                                <button
                                    className='print-btn'
                                    onClick={exportSummaryToPdf}
                                    title="Друк зведення"
                                    style={{ padding: '0.5rem 0.8rem', fontSize: '1.2rem', background: 'var(--navy)', color: 'white', border: '1px solid var(--gold)', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = 'var(--navy)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--navy)'; e.currentTarget.style.color = 'white'; }}
                                >
                                    <TfiPrinter />
                                </button>
                            )}
                            {!showSummaryModal && selectedType && items.length > 0 && (
                                <button
                                    className='print-btn'
                                    onClick={exportBrigadeTableToPdf}
                                    title="Друк таблиці"
                                    style={{ padding: '0.5rem 0.8rem', fontSize: '1.2rem', background: 'var(--navy)', color: 'white', border: '1px solid var(--gold)', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = 'var(--navy)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--navy)'; e.currentTarget.style.color = 'white'; }}
                                >
                                    <TfiPrinter />
                                </button>
                            )}
                        </div>
                    )}

                    {loading || summaryLoading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}><LoadingSpinner /></div>
                    ) : showSummaryModal ? (
                        <div className="gr-table-wrapper" style={{ minWidth: '100%' }}>
                            <div style={{ minWidth: `${(summaryData?.columns?.length || 0) * 120 + 400}px` }}>
                                <div className="gr-content-title" style={{ gridTemplateColumns: `0.4fr 3.5fr ${summaryData?.columns?.map(() => 'minmax(100px, 1.5fr)').join(' ')} 0.8fr` }}>
                                    <span>№</span>
                                    <span>Найменування</span>
                                    {summaryData?.columns?.map(c => <span key={c}>{c}</span>)}
                                    <span>Загальна потреба</span>
                                </div>

                                {(() => {
                                    const visibleRows = summaryData?.rows?.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase())) || []
                                    const visibleTotals = (summaryData?.columns || []).reduce((acc, c) => {
                                        acc[c] = visibleRows.reduce((sum, r) => sum + (Number(r[c]) || 0), 0)
                                        return acc
                                    }, {})
                                    const visibleGrandTotal = visibleRows.reduce((sum, r) => sum + (Number(r.total) || 0), 0)

                                    return (
                                        <>
                                            {visibleRows.map((row, index) => (
                                                <div key={row.id} className="gr-content-row" style={{ gridTemplateColumns: `0.4fr 3.5fr ${summaryData?.columns?.map(() => 'minmax(100px, 1.5fr)').join(' ')} 0.8fr` }}>
                                                    <span data-label="№:">{index + 1}</span>
                                                    <span data-label="Найменування:" className="gr-item-name">{row.name}</span>
                                                    {summaryData?.columns?.map(c => <span data-label={`${c}:`} key={c}>{row[c] || 0}</span>)}
                                                    <span data-label="Загальна потреба:" className="gr-total-need">{row.total}</span>
                                                </div>
                                            ))}

                                            {visibleRows.length === 0 && (
                                                <div className="gr-empty">Немає даних</div>
                                            )}

                                            {visibleRows.length > 0 && (
                                                <div className="gr-content-row" style={{ gridTemplateColumns: `0.4fr 3.5fr ${summaryData?.columns?.map(() => 'minmax(100px, 1.5fr)').join(' ')} 0.8fr`, background: 'var(--gray-50)', fontWeight: 'bold' }}>
                                                    <span data-label=""></span>
                                                    <span data-label="Найменування:" className="gr-item-name">Всього</span>
                                                    {summaryData?.columns?.map(c => <span data-label={`${c}:`} key={c}>{visibleTotals[c] || 0}</span>)}
                                                    <span data-label="Загальна потреба:" className="gr-total-need">{visibleGrandTotal}</span>
                                                </div>
                                            )}
                                        </>
                                    )
                                })()}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* ── Table ── */}
                            <div className={`gr-table-wrapper${isGod && isEditing ? ' gr-table-wrapper--scrollable' : ''}`}>
                                <div className="gr-content-title">
                                    <span>№</span>
                                    <span>Найменування</span>
                                    <span>Норма на одиницю техніки</span>

                                    <span>В наявності</span>
                                    <span>Не комплект</span>
                                    <span>Резерв частини (норма)</span>
                                    <span>Резерв частини (наявн.)</span>
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
                                            <span data-label="№:">{index + 1}</span>
                                            <span data-label="Найменування:" className="gr-item-name">
                                                {isGod && isEditing ? (
                                                    <input
                                                        type="text"
                                                        className="gr-input"
                                                        value={item.name || ''}
                                                        onBlur={(e) => handleItemFieldChange(item.id, 'name', e.target.value)}
                                                        onChange={(e) => {
                                                            const newItems = items.map(i => i.id === item.id ? { ...i, name: e.target.value } : i)
                                                            setItems(newItems)
                                                        }}
                                                        style={{ width: '100%' }}
                                                    />
                                                ) : (
                                                    item.name
                                                )}
                                            </span>
                                            <span data-label="Норма на одиницю техніки:">
                                                {isGod && isEditing ? (
                                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                        <select
                                                            value={item.required_rule || 'exact'}
                                                            onChange={(e) => {
                                                                const newRule = e.target.value
                                                                handleItemFieldChange(item.id, 'required_rule', newRule, totalNeed)
                                                                const newItems = items.map(i => i.id === item.id ? { ...i, required_rule: newRule } : i)
                                                                setItems(newItems)
                                                            }}
                                                            className="gr-select-rule"
                                                            style={{ maxWidth: '100px', fontSize: '0.85rem' }}
                                                        >
                                                            <option value="exact">Точно</option>
                                                            <option value="min">Мінімум</option>
                                                            <option value="tu">ТУ</option>
                                                        </select>
                                                        {item.required_rule !== 'tu' && (
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
                                                                style={{ maxWidth: '60px' }}
                                                            />
                                                        )}
                                                    </div>
                                                ) : (
                                                    item.required_rule === 'tu' ? 'Відповідно до ТУ' :
                                                        item.required_rule === 'min' ? `не менше ${reqPerVehicle}` : reqPerVehicle
                                                )}
                                            </span>

                                            <span data-label="В наявності:">
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
                                            <span data-label="Не комплект:" className={vehicleShortage > 0 ? 'gr-shortage' : ''}>{vehicleShortage > 0 ? vehicleShortage : '—'}</span>
                                            <span data-label="Резерв частини (норма):">
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
                                            <span data-label="Резерв частини (наявн.):">
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
                                            <span data-label="Не комплект:" className={warehouseShortage > 0 ? 'gr-shortage' : ''}>{warehouseShortage > 0 ? warehouseShortage : '—'}</span>
                                            <span data-label="Загальна потреба:" className={totalNeed > 0 ? 'gr-total-need' : ''}>{totalNeed > 0 ? totalNeed : '—'}</span>
                                            {isGod && isEditing && (
                                                <span data-label="Дії:">
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
                                        <select
                                            value={newItemRequiredRule}
                                            onChange={(e) => setNewItemRequiredRule(e.target.value)}
                                            className="gr-select-rule"
                                        >
                                            <option value="exact">Точно</option>
                                            <option value="min">Мінімум</option>
                                            <option value="tu">Відповідно до ТУ</option>
                                        </select>
                                        {newItemRequiredRule !== 'tu' && (
                                            <input
                                                type="number"
                                                value={newItemPerVehicle}
                                                onChange={(e) => setNewItemPerVehicle(e.target.value)}
                                                placeholder="Норма на 1 авто"
                                                min="0"
                                            />
                                        )}
                                        <input
                                            type="number"
                                            value={newItemWarehouseRequired}
                                            onChange={(e) => setNewItemWarehouseRequired(e.target.value)}
                                            placeholder="Резерв частини (норма)"
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