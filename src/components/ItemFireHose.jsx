import React, { useState, useMemo, useRef } from 'react'
import { MdUpdate, MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext.jsx'
import {
    createFireHose,
    updateFireHose,
    bulkUpdateFireHoses,
    openInternalDocumentLink,
    uploadEquipmentDocumentBulk,
    archiveEquipmentItem,
} from '../api/services.js'
import DocumentUploader from './DocumentUploader.jsx'
import ArchiveModal from './ArchiveModal.jsx'
import '../scss/itemtest.scss'
import '../scss/watersupply.scss'

const HOSE_TYPES = [
    { value: 'pressure', label: 'Напірні' },
    { value: 'suction', label: 'Всмоктуючі' },
    { value: 'pressure-suction', label: 'Напірно-всмоктуючі' },
]

const TYPE_LABEL = Object.fromEntries(HOSE_TYPES.map(t => [t.value, t.label]))

const formatDate = (dateString) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('uk-UA')
}

const emptyAddForm = {
    inventoryNumber: '',
    diameter: '',
    length: '',
    quantity: 1,
    manufactureDate: '',
    lastTestDate: '',
    nextTestDate: '',
    result: 'pass',
    linkName: '',
    link: '',
    notes: '',
}

const emptyBulkForm = {
    lastTestDate: '',
    nextTestDate: '',
    result: 'pass',
    linkName: '',
    link: '',
}

const groupByDiameter = (list) => {
    const map = new Map()
    for (const item of list) {
        const key = item.diameter || '—'
        if (!map.has(key)) map.set(key, [])
        map.get(key).push(item)
    }
    return [...map.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0]), undefined, { numeric: true }))
}

const ItemFireHose = ({ items, selectedBrigade, onChanged }) => {
    const { user } = useAuth()
    const canEdit = user?.role === 'GOD' || user?.role === 'RW'

    const [expandedType, setExpandedType] = useState(null)
    const [expandedDiameters, setExpandedDiameters] = useState({})
    const [addingType, setAddingType] = useState(null)

    const toggleDiameter = (typeValue, diameter) => {
        const key = `${typeValue}::${diameter}`
        setExpandedDiameters(prev => ({ ...prev, [key]: !prev[key] }))
    }
    const [formData, setFormData] = useState(emptyAddForm)
    const [editingId, setEditingId] = useState(null)
    const [editData, setEditData] = useState({})

    // Bulk selection state — scoped per (type, diameter) group
    const [selectingKey, setSelectingKey] = useState(null)
    const [selectingLabel, setSelectingLabel] = useState('')
    const [selectedIds, setSelectedIds] = useState([])
    const [showBulkModal, setShowBulkModal] = useState(false)
    const [bulkForm, setBulkForm] = useState(emptyBulkForm)
    const [isBulkSaving, setIsBulkSaving] = useState(false)
    const [isBulkUploading, setIsBulkUploading] = useState(false)
    const bulkFileInputRef = useRef(null)

    const makeSelectKey = (typeValue, diameter) => `${typeValue}::${diameter}`

    const toggleSelectMode = (typeValue, diameter) => {
        const key = makeSelectKey(typeValue, diameter)
        setSelectedIds([])
        setSelectingKey(prev => prev === key ? null : key)
        setSelectingLabel(prev => prev && prev.includes(`::${diameter}`) ? '' : `${TYPE_LABEL[typeValue]} · Ø${diameter} мм`)
    }
    const toggleItemSelection = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }

    const handleBulkSubmit = async (e) => {
        e.preventDefault()
        if (selectedIds.length === 0) return
        setIsBulkSaving(true)
        try {
            await bulkUpdateFireHoses({
                itemIds: selectedIds,
                data: {
                    lastTestDate: bulkForm.lastTestDate || null,
                    nextTestDate: bulkForm.nextTestDate || null,
                    result: bulkForm.result,
                    linkName: bulkForm.linkName || null,
                    link: bulkForm.link || null,
                },
            })
            toast.success(`Оновлено ${selectedIds.length} шт.`)
            setShowBulkModal(false)
            setSelectingKey(null)
            setSelectingLabel('')
            setSelectedIds([])
            setBulkForm(emptyBulkForm)
            onChanged()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка масового оновлення')
        } finally {
            setIsBulkSaving(false)
        }
    }

    const handleBulkPdfUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.type !== 'application/pdf') {
            toast.error('Тільки PDF')
            e.target.value = ''
            return
        }
        if (selectedIds.length === 0) {
            toast.error('Не вибрано жодного рукава')
            e.target.value = ''
            return
        }
        setIsBulkUploading(true)
        try {
            const docs = await uploadEquipmentDocumentBulk({
                equipmentType: 'FireHose',
                equipmentIds: selectedIds,
                brigadeId: selectedBrigade,
                documentName: bulkForm.linkName?.trim() || file.name,
                file,
            })
            const firstDoc = docs[0]
            setBulkForm(prev => ({
                ...prev,
                linkName: firstDoc?.documentName || prev.linkName,
                link: firstDoc ? `/api/equipment-documents/${firstDoc.id}/download` : prev.link,
            }))
            toast.success(`PDF прикріплено до ${docs.length} рукавів`)
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка завантаження')
        } finally {
            setIsBulkUploading(false)
            e.target.value = ''
        }
    }

    const byType = useMemo(() => {
        const map = Object.fromEntries(HOSE_TYPES.map(t => [t.value, []]))
        for (const item of items) {
            const key = HOSE_TYPES.find(t => t.value === item.type) ? item.type : 'pressure'
            map[key].push(item)
        }
        return map
    }, [items])

    const openAddForm = (typeValue) => {
        setAddingType(typeValue)
        setFormData(emptyAddForm)
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        if (!addingType) return

        const qty = Math.max(1, parseInt(formData.quantity) || 1)
        const invRaw = formData.inventoryNumber.trim()
        let prefix = ''
        let baseNum = 0
        let hasNumber = false
        if (invRaw) {
            const match = invRaw.match(/^(.*?)(\d+)$/)
            if (match) {
                prefix = match[1]
                baseNum = parseInt(match[2], 10)
                hasNumber = true
            }
        }

        try {
            for (let i = 0; i < qty; i++) {
                let inventoryNumber = null
                if (invRaw) {
                    inventoryNumber = hasNumber
                        ? `${prefix}${baseNum + i}`
                        : (qty === 1 ? invRaw : `${invRaw}-${i + 1}`)
                }
                await createFireHose({
                    inventoryNumber,
                    name: TYPE_LABEL[addingType],
                    type: addingType,
                    diameter: formData.diameter || null,
                    length: formData.length || null,
                    manufactureDate: formData.manufactureDate || null,
                    lastTestDate: formData.lastTestDate || null,
                    nextTestDate: formData.nextTestDate || null,
                    result: formData.result,
                    linkName: formData.linkName || null,
                    link: formData.link || null,
                    notes: formData.notes || null,
                    brigadeId: selectedBrigade,
                })
            }
            toast.success(`Створено ${qty} шт.`)
            setAddingType(null)
            setFormData(emptyAddForm)
            onChanged()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка створення')
        }
    }

    const handleEditClick = (item) => {
        setEditingId(item.id)
        setEditData({
            inventoryNumber: item.inventoryNumber || '',
            diameter: item.diameter || '',
            length: item.length || '',
            manufactureDate: item.manufactureDate ? item.manufactureDate.split('T')[0] : '',
            lastTestDate: item.lastTestDate ? item.lastTestDate.split('T')[0] : '',
            nextTestDate: item.nextTestDate ? item.nextTestDate.split('T')[0] : '',
            result: item.result || 'pass',
            linkName: item.linkName || '',
            link: item.link || '',
            notes: item.notes || '',
        })
    }

    const handleUpdate = async (e, id) => {
        e.preventDefault()
        try {
            await updateFireHose(id, {
                ...editData,
                manufactureDate: editData.manufactureDate || null,
                lastTestDate: editData.lastTestDate || null,
                nextTestDate: editData.nextTestDate || null,
            })
            setEditingId(null)
            setEditData({})
            toast.success('Збережено')
            onChanged()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка збереження')
        }
    }

    const [itemToArchive, setItemToArchive] = useState(null)

    const handleConfirmArchive = async (archiveData) => {
        if (!itemToArchive) return
        try {
            await archiveEquipmentItem({
                equipmentType: 'FireHose',
                originalId: itemToArchive.id,
                ...archiveData,
            })
            if (editingId === itemToArchive.id) {
                setEditingId(null)
                setEditData({})
            }
            onChanged()
        } catch (err) {
            console.error('Failed to archive FireHose:', err)
            throw err
        }
    }

    return (
        <div className='hose-sections'>
            {selectingKey && (
                <div className='bulk-actions-bar hose-bulk-bar-sticky'>
                    <span className='bulk-count'>{selectingLabel} — обрано: {selectedIds.length}</span>
                    {selectedIds.length > 0 && (
                        <button className='bulk-update-btn' onClick={() => setShowBulkModal(true)}>
                            Оновити обрані ({selectedIds.length})
                        </button>
                    )}
                </div>
            )}
            {HOSE_TYPES.map(typeDef => {
                const list = byType[typeDef.value] || []
                const isExpanded = expandedType === typeDef.value
                const groups = groupByDiameter(list)

                return (
                    <div className='item-wrapper' key={typeDef.value}>
                        <div className='item-header' style={{ cursor: 'pointer' }}
                            onClick={() => setExpandedType(isExpanded ? null : typeDef.value)}>
                            <div className='item-header-title'>
                                <h2>{typeDef.label} — {list.length} шт.</h2>
                                <div className='item-header-actions'>
                                    {canEdit && (
                                        <h3 className='add-btn'
                                            onClick={(e) => { e.stopPropagation(); openAddForm(typeDef.value) }}>
                                            + додати
                                        </h3>
                                    )}
                                </div>
                            </div>
                        </div>

                        {isExpanded && (
                            <div className='item-body expanded'>
                                {groups.length === 0 ? (
                                    <p>Рукавів цього типу ще не додано</p>
                                ) : (
                                    groups.map(([diameter, hoses]) => {
                                        const diaKey = `${typeDef.value}::${diameter}`
                                        const isDiaExpanded = !!expandedDiameters[diaKey]
                                        const selectKey = makeSelectKey(typeDef.value, diameter)
                                        const isSelectingHere = selectingKey === selectKey
                                        const hoseIds = hoses.map(h => h.id)
                                        const allSelected = isSelectingHere && hoseIds.every(id => selectedIds.includes(id))
                                        return (
                                        <div key={diameter} className='hose-diameter-group'>
                                            <div className='hose-diameter-header'>
                                                <h3 className='hose-diameter-title'
                                                    style={{ cursor: 'pointer', userSelect: 'none', margin: 0 }}
                                                    onClick={() => toggleDiameter(typeDef.value, diameter)}>
                                                    <span className='hose-diameter-caret'>{isDiaExpanded ? '▾' : '▸'}</span>{' '}
                                                    Діаметр: {diameter} мм — {hoses.length} шт.
                                                </h3>
                                                {canEdit && isDiaExpanded && hoses.length > 0 && (
                                                    <div className='hose-diameter-actions'>
                                                        <button type='button'
                                                            className={`bulk-select-btn ${isSelectingHere ? 'active' : ''}`}
                                                            onClick={(e) => { e.stopPropagation(); toggleSelectMode(typeDef.value, diameter) }}>
                                                            {isSelectingHere ? '✕ Скасувати' : '☑ Обрати'}
                                                        </button>
                                                        {isSelectingHere && (
                                                            <button type='button' className='select-all-type-btn'
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    if (allSelected) {
                                                                        setSelectedIds(prev => prev.filter(id => !hoseIds.includes(id)))
                                                                    } else {
                                                                        setSelectedIds(prev => [...new Set([...prev, ...hoseIds])])
                                                                    }
                                                                }}>
                                                                {allSelected ? '☐ Зняти всі' : `☑ Обрати всі (${hoseIds.length})`}
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {isDiaExpanded && (
                                                <div className='item-header-row hose-header-row'>
                                                    <span>інв. №</span>
                                                    <span>довжина</span>
                                                    <span>дата виготовлення</span>
                                                    <span>дата випробування</span>
                                                    <span>наступне випробування</span>
                                                    <span>результат</span>
                                                    <span>посилання на акт</span>
                                                    <span>оновити</span>
                                                </div>
                                            )}
                                            {isDiaExpanded && hoses.sort((a, b) => a.id - b.id).map(item => (
                                                <div key={item.id} className='item-row-container'>
                                                    {editingId === item.id ? (
                                                        <form className='edit-form' onSubmit={(e) => handleUpdate(e, item.id)}>
                                                            <input type='text' placeholder='Інв. номер' value={editData.inventoryNumber}
                                                                onChange={(e) => setEditData({ ...editData, inventoryNumber: e.target.value })} />
                                                            <input type='text' placeholder='Діаметр (мм)' value={editData.diameter}
                                                                onChange={(e) => setEditData({ ...editData, diameter: e.target.value })} />
                                                            <input type='text' placeholder='Довжина (м)' value={editData.length}
                                                                onChange={(e) => setEditData({ ...editData, length: e.target.value })} />
                                                            <input type='date' value={editData.manufactureDate}
                                                                onChange={(e) => setEditData({ ...editData, manufactureDate: e.target.value })} />
                                                            <input type='date' value={editData.lastTestDate}
                                                                onChange={(e) => setEditData({ ...editData, lastTestDate: e.target.value })} />
                                                            <input type='date' value={editData.nextTestDate}
                                                                onChange={(e) => setEditData({ ...editData, nextTestDate: e.target.value })} />
                                                            <select value={editData.result}
                                                                onChange={(e) => setEditData({ ...editData, result: e.target.value })}>
                                                                <option value='pass'>Придатний</option>
                                                                <option value='fail'>Непридатний</option>
                                                            </select>
                                                            <div className='link-box'>
                                                                <input type='text' placeholder='Назва документу' value={editData.linkName}
                                                                    onChange={(e) => setEditData({ ...editData, linkName: e.target.value })} />
                                                                <input type='text' placeholder='Посилання на документ' value={editData.link}
                                                                    onChange={(e) => setEditData({ ...editData, link: e.target.value })} />
                                                            </div>
                                                            <textarea placeholder='Нотатки' value={editData.notes}
                                                                onChange={(e) => setEditData({ ...editData, notes: e.target.value })} />
                                                            <div className='edit-actions'>
                                                                <button type='submit' className='save-btn'>Зберегти</button>
                                                                <DocumentUploader
                                                                    equipmentType='FireHose'
                                                                    equipmentId={item.id}
                                                                    brigadeId={selectedBrigade}
                                                                    canEdit={canEdit}
                                                                    onUploaded={(doc) => setEditData(prev => ({
                                                                        ...prev,
                                                                        linkName: doc.documentName,
                                                                        link: `/api/equipment-documents/${doc.id}/download`,
                                                                    }))}
                                                                />
                                                                <button type='button' className='archive-btn'
                                                                    onClick={() => setItemToArchive(item)}
                                                                    style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                                                                    Списати
                                                                </button>
                                                                <button type='button' className='cancel-btn' onClick={() => setEditingId(null)}>Відмінити</button>
                                                            </div>
                                                        </form>
                                                    ) : (
                                                        <div className={`item-row ${item.result === 'pass' ? 'item-pass' : 'item-fail'}`}>
                                                            {isSelectingHere && (
                                                                <span className='bulk-checkbox' onClick={() => toggleItemSelection(item.id)}>
                                                                    {selectedIds.includes(item.id)
                                                                        ? <MdCheckBox className='checked' />
                                                                        : <MdCheckBoxOutlineBlank />}
                                                                </span>
                                                            )}
                                                            <span style={{ flex: '0.7' }} title='Інв. №'>{item.inventoryNumber || '—'}</span>
                                                            <span style={{ flex: '0.5' }} title='Довжина'>{item.length || '—'} м</span>
                                                            <span style={{ flex: '1' }} title='Виготовлено'>{formatDate(item.manufactureDate)}</span>
                                                            <span style={{ flex: '1' }} title='Випробування'>{formatDate(item.lastTestDate)}</span>
                                                            <span style={{ flex: '1' }} title='Наступне'>{formatDate(item.nextTestDate)}</span>
                                                            <span style={{ flex: '0.7' }} title='Результат'>{item.result === 'pass' ? 'Придатний' : 'Непридатний'}</span>
                                                            <span className='link-cell' style={{ flex: '0.7' }}>
                                                                {item.link ? (
                                                                    item.link.startsWith('/api/equipment-documents/') ? (
                                                                        <button type='button'
                                                                            onClick={(e) => { e.stopPropagation(); openInternalDocumentLink(item.link).catch(() => toast.error('Не вдалося відкрити документ')) }}
                                                                            style={{ background: 'none', border: 'none', padding: 0, color: 'var(--navy)', textDecoration: 'underline', cursor: 'pointer', font: 'inherit' }}>
                                                                            {item.linkName || 'Акт'}
                                                                        </button>
                                                                    ) : (
                                                                        <a href={item.link} target='_blank' rel='noreferrer' style={{ color: 'var(--navy)', textDecoration: 'underline' }}>{item.linkName || 'Акт'}</a>
                                                                    )
                                                                ) : '—'}
                                                            </span>
                                                            {!isSelectingHere && canEdit && (
                                                                <button className='update-btn' title='Редагувати' onClick={() => handleEditClick(item)}>
                                                                    <MdUpdate />
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        )
                                    })
                                )}
                            </div>
                        )}
                    </div>
                )
            })}

            {showBulkModal && (
                <div className='modal-overlay' onClick={() => setShowBulkModal(false)}>
                    <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                        <div className='modal-header'>
                            <h3>Масове оновлення ({selectedIds.length} рукавів)</h3>
                            <button className='close-btn' onClick={() => setShowBulkModal(false)}>✕</button>
                        </div>
                        <form className='add-form' onSubmit={handleBulkSubmit}>
                            <label>Дата випробування:</label>
                            <input type='date' value={bulkForm.lastTestDate}
                                onChange={(e) => setBulkForm({ ...bulkForm, lastTestDate: e.target.value })} />

                            <label>Наступне випробування:</label>
                            <input type='date' value={bulkForm.nextTestDate}
                                onChange={(e) => setBulkForm({ ...bulkForm, nextTestDate: e.target.value })} />

                            <label>Результат:</label>
                            <select value={bulkForm.result}
                                onChange={(e) => setBulkForm({ ...bulkForm, result: e.target.value })}>
                                <option value='pass'>Придатний</option>
                                <option value='fail'>Непридатний</option>
                            </select>

                            <input type='text' placeholder='Назва документу' value={bulkForm.linkName}
                                onChange={(e) => setBulkForm({ ...bulkForm, linkName: e.target.value })} />
                            <input type='text' placeholder='Посилання на документ' value={bulkForm.link}
                                onChange={(e) => setBulkForm({ ...bulkForm, link: e.target.value })} />

                            <input
                                ref={bulkFileInputRef}
                                type='file'
                                accept='application/pdf'
                                onChange={handleBulkPdfUpload}
                                disabled={isBulkUploading}
                                style={{ display: 'none' }}
                            />
                            <button type='button'
                                onClick={() => bulkFileInputRef.current?.click()}
                                disabled={isBulkUploading || selectedIds.length === 0}
                                style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
                                {isBulkUploading ? 'Завантаження…' : `+ PDF документ для ${selectedIds.length} рукавів`}
                            </button>

                            <button type='submit' disabled={isBulkSaving}>
                                {isBulkSaving ? 'Збереження…' : `Оновити ${selectedIds.length} рукавів`}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {addingType && (
                <div className='modal-overlay' onClick={() => setAddingType(null)}>
                    <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                        <div className='modal-header'>
                            <h3>Додати — {TYPE_LABEL[addingType]}</h3>
                            <button className='close-btn' onClick={() => setAddingType(null)}>✕</button>
                        </div>
                        <form className='add-form' onSubmit={handleCreate}>
                            <input type='text' placeholder='Інв. номер (напр. Р-100)' value={formData.inventoryNumber}
                                onChange={(e) => setFormData({ ...formData, inventoryNumber: e.target.value })} />
                            <input type='text' placeholder='Діаметр (мм)' required value={formData.diameter}
                                onChange={(e) => setFormData({ ...formData, diameter: e.target.value })} />
                            <input type='text' placeholder='Довжина (м)' value={formData.length}
                                onChange={(e) => setFormData({ ...formData, length: e.target.value })} />

                            <label>Кількість:</label>
                            <input type='number' min='1' max='100' value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />

                            <label>Дата виготовлення:</label>
                            <input type='date' value={formData.manufactureDate}
                                onChange={(e) => setFormData({ ...formData, manufactureDate: e.target.value })} />
                            <label>Дата випробування:</label>
                            <input type='date' value={formData.lastTestDate}
                                onChange={(e) => setFormData({ ...formData, lastTestDate: e.target.value })} />
                            <label>Наступне випробування:</label>
                            <input type='date' value={formData.nextTestDate}
                                onChange={(e) => setFormData({ ...formData, nextTestDate: e.target.value })} />
                            <select value={formData.result}
                                onChange={(e) => setFormData({ ...formData, result: e.target.value })}>
                                <option value='pass'>Придатний</option>
                                <option value='fail'>Непридатний</option>
                            </select>
                            <input type='text' placeholder='Назва документу' value={formData.linkName}
                                onChange={(e) => setFormData({ ...formData, linkName: e.target.value })} />
                            <input type='url' placeholder='Посилання на документ' value={formData.link}
                                onChange={(e) => setFormData({ ...formData, link: e.target.value })} />
                            <textarea placeholder='Нотатки' value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                            <button type='submit'>
                                Створити {formData.quantity > 1 ? `(${formData.quantity} шт.)` : ''}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <ArchiveModal
                isOpen={!!itemToArchive}
                itemName={itemToArchive?.name || (itemToArchive && `${TYPE_LABEL[itemToArchive.type] || ''} Ø${itemToArchive.diameter || '—'}`)}
                equipmentType='FireHose'
                equipmentId={itemToArchive?.id}
                brigadeId={selectedBrigade}
                onClose={() => setItemToArchive(null)}
                onConfirm={handleConfirmArchive}
            />
        </div>
    )
}

export default ItemFireHose
