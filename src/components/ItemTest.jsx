import React, { useState } from 'react'
import { MdUpdate, MdSettings } from "react-icons/md";
import { FaArrowDownWideShort } from "react-icons/fa6";
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";
import { toast } from 'react-toastify'
import { createTestItem, updateTestItem, bulkUpdateTestItems, archiveEquipmentItem, updateTestList } from '../api/services.js';
import { useAuth } from '../context/AuthContext.jsx'
import ArchiveModal from './ArchiveModal.jsx'
import '../scss/itemtest.scss'

// testDate (YYYY-MM-DD) + months → YYYY-MM-DD; preserves local date semantics.
const addMonthsToISODate = (isoDateStr, months) => {
    if (!isoDateStr || !months) return ''
    const [y, m, d] = isoDateStr.split('-').map(Number)
    if (!y || !m || !d) return ''
    const dt = new Date(y, m - 1, d)
    dt.setMonth(dt.getMonth() + months)
    const yyyy = dt.getFullYear()
    const mm = String(dt.getMonth() + 1).padStart(2, '0')
    const dd = String(dt.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
}

const ItemTest = ({ testList, selectedBrigade, onItemCreated, searchQuery = '' }) => {
    const { user } = useAuth()
    const [showForm, setShowForm] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)

    const [formData, setFormData] = useState({
        inventoryNumber: '',
        name: '',
        testDate: '',
        result: 'pass',
        nextTestDate: '',
        linkName: '',
        link: '',
        quantity: 1
    })

    const [editingItemId, setEditingItemId] = useState(null)
    const [editFormData, setEditFormData] = useState({})

    // Bulk update state
    const [isSelecting, setIsSelecting] = useState(false)
    const [selectedIds, setSelectedIds] = useState([])
    const [showBulkModal, setShowBulkModal] = useState(false)
    const [bulkFormData, setBulkFormData] = useState({
        testDate: '',
        result: 'pass',
        nextTestDate: '',
        linkName: '',
        link: ''
    })

    // ── Archive state ──
    const [itemToArchive, setItemToArchive] = useState(null)
    const [isBulkSaving, setIsBulkSaving] = useState(false)

    // ── GOD interval-settings modal ──
    const [showIntervalModal, setShowIntervalModal] = useState(false)
    const [intervalDraft, setIntervalDraft] = useState('')
    const [isSavingInterval, setIsSavingInterval] = useState(false)

    const openIntervalModal = () => {
        setIntervalDraft(testList.intervalMonths ?? '')
        setShowIntervalModal(true)
    }

    const handleSaveInterval = async (e) => {
        e.preventDefault()
        setIsSavingInterval(true)
        try {
            const raw = String(intervalDraft).trim()
            const value = raw === '' ? null : parseInt(raw, 10)
            await updateTestList(testList.id, { intervalMonths: value })
            toast.success('Інтервал збережено')
            setShowIntervalModal(false)
            onItemCreated()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка збереження інтервалу')
            console.error('Failed to update testList interval:', err)
        } finally {
            setIsSavingInterval(false)
        }
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        if (!formData.name.trim()) return

        const qty = Math.max(1, parseInt(formData.quantity) || 1)

        // Розбираємо інвентарний номер на префікс і число
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

                await createTestItem({
                    inventoryNumber,
                    name: formData.name,
                    testDate: formData.testDate || null,
                    result: formData.result,
                    nextTestDate: formData.nextTestDate || null,
                    linkName: formData.linkName || null,
                    link: formData.link || null,
                    testListId: testList.id,
                    brigadeId: selectedBrigade,
                })
            }

            setFormData({
                inventoryNumber: '',
                name: '',
                testDate: '',
                result: 'pass',
                nextTestDate: '',
                linkName: '',
                link: '',
                quantity: 1
            })
            setShowForm(false)
            onItemCreated()
        } catch (err) {
            console.error('Failed to create item:', err)
        }
    }

    const handleUpdateSubmit = async (e, id) => {
        e.preventDefault()
        if (!editFormData.name.trim()) return

        try {
            await updateTestItem(id, {
                inventoryNumber: editFormData.inventoryNumber || null,
                name: editFormData.name,
                testDate: editFormData.testDate || null,
                result: editFormData.result,
                nextTestDate: editFormData.nextTestDate || null,
                linkName: editFormData.linkName || null,
                link: editFormData.link || null,
            });

            setEditingItemId(null)
            onItemCreated() // refetch the updated data
        } catch (err) {
            console.error('Failed to update item:', err)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        const next = { ...formData, [name]: value }
        if (name === 'testDate' && testList.intervalMonths) {
            next.nextTestDate = addMonthsToISODate(value, testList.intervalMonths)
        }
        setFormData(next)
    }

    const handleEditChange = (e) => {
        const { name, value } = e.target
        const next = { ...editFormData, [name]: value }
        if (name === 'testDate' && testList.intervalMonths) {
            next.nextTestDate = addMonthsToISODate(value, testList.intervalMonths)
        }
        setEditFormData(next)
    }

    const handleEditClick = (item) => {
        setEditingItemId(item.id)
        setEditFormData({
            inventoryNumber: item.inventoryNumber || '',
            name: item.name || '',
            testDate: item.testDate ? item.testDate.split('T')[0] : '',
            result: item.result || 'pass',
            nextTestDate: item.nextTestDate ? item.nextTestDate.split('T')[0] : '',
            linkName: item.linkName || '',
            link: item.link || ''
        })
    }

    const handleCancelEdit = () => {
        setEditingItemId(null)
        setEditFormData({})
    }

    // ── Bulk update handlers ──
    const toggleSelectMode = () => {
        if (isSelecting) {
            setSelectedIds([])
        }
        setIsSelecting(!isSelecting)
    }

    const toggleItemSelection = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
    }

    const selectAll = () => {
        const allIds = (testList.TestItems || []).map(item => item.id)
        if (selectedIds.length === allIds.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(allIds)
        }
    }

    const handleBulkChange = (e) => {
        const { name, value } = e.target
        const next = { ...bulkFormData, [name]: value }
        if (name === 'testDate' && testList.intervalMonths) {
            next.nextTestDate = addMonthsToISODate(value, testList.intervalMonths)
        }
        setBulkFormData(next)
    }

    const handleBulkSubmit = async (e) => {
        e.preventDefault()
        if (selectedIds.length === 0) return

        setIsBulkSaving(true)
        try {
            await bulkUpdateTestItems({
                itemIds: selectedIds,
                data: {
                    testDate: bulkFormData.testDate || null,
                    result: bulkFormData.result,
                    nextTestDate: bulkFormData.nextTestDate || null,
                    linkName: bulkFormData.linkName || null,
                    link: bulkFormData.link || null,
                }
            })

            setShowBulkModal(false)
            setIsSelecting(false)
            setSelectedIds([])
            setBulkFormData({ testDate: '', result: 'pass', nextTestDate: '', linkName: '', link: '' })
            onItemCreated()
        } catch (err) {
            console.error('Failed to bulk update:', err)
        } finally {
            setIsBulkSaving(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return '—'
        return new Date(dateString).toLocaleDateString('uk-UA')
    }

    // ── Archive handlers ──
    const handleOpenArchive = (item) => {
        setItemToArchive(item)
    }

    const handleConfirmArchive = async (archiveData) => {
        if (!itemToArchive) return
        try {
            await archiveEquipmentItem({
                equipmentType: 'TestItem',
                originalId: itemToArchive.id,
                ...archiveData
            })

            // Refresh the list after successful archiving
            onItemCreated()

            // Re-fetch all data to make sure badges/counts update correctly
            if (testList.id) {
                // If there's an overarching fetch to trigger (not explicitly exposed here, but onItemCreated works locally for the brigade)
            }

            // Close edit mode if applicable
            if (editingItemId === itemToArchive.id) {
                handleCancelEdit()
            }
        } catch (error) {
            console.error('Failed to archive TestItem:', error)
            throw error // Throw so the modal can handle it
        }
    }

    return (
        <div className='item-wrapper'>
            <div className='item-header' onClick={() => setIsExpanded(!isExpanded)} style={{ cursor: 'pointer' }}>
                <div className='item-header-title'>
                    <div className='item-header-title-add' style={{ flex: 1, userSelect: 'none' }}>
                        <h2>
                            {testList.name} - {testList.TestItems?.length} шт.
                            {testList.intervalMonths ? <span style={{ fontSize: '0.75em', fontWeight: 400, marginLeft: '0.5rem', color: 'var(--gray-600)' }}>(інтервал: {testList.intervalMonths} міс)</span> : null}
                        </h2>
                    </div>

                    <div className='item-header-actions'>
                        {user?.role === 'GOD' && (
                            <button
                                type='button'
                                title='Налаштувати інтервал випробувань'
                                onClick={(e) => { e.stopPropagation(); openIntervalModal(); }}
                                style={{ background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
                            >
                                <MdSettings size={20} />
                            </button>
                        )}
                        {isExpanded && testList.TestItems?.length > 0 && (
                            <h3 className={`bulk-select-btn ${isSelecting ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleSelectMode(); }}>
                                {isSelecting ? '✕ Скасувати' : '☑ Обрати'}
                            </h3>
                        )}
                        {isExpanded && (
                            <h3 className='add-btn' onClick={(e) => { e.stopPropagation(); setShowForm(!showForm); }}>
                                {showForm ? '✕' : '+ додати'}
                            </h3>
                        )}
                    </div>
                </div>
                {isExpanded && testList.TestItems?.length > 0 && (
                    <div className='item-header-row'>
                        <span>івентарний номер</span>
                        <span>назва обладнання</span>
                        <span>дата випробування</span>
                        <span>результат</span>
                        <span>наступне випробування</span>
                        <span>посилання на акт/протокол</span>
                        <span>оновити дані</span>
                    </div>
                )}
            </div>

            {showForm && (
                <div className='modal-overlay' onClick={() => setShowForm(false)}>
                    <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Додати обладнання</h3>
                            <button className="close-btn" onClick={() => setShowForm(false)}>✕</button>
                        </div>
                        <form className='add-form' onSubmit={handleCreate}>
                            <input type='text' name='inventoryNumber' placeholder='Інв. номер (напр. ВП-100)' value={formData.inventoryNumber} onChange={handleChange} />
                            <input type='text' name='name' placeholder='Назва обладнання' value={formData.name} onChange={handleChange} required />

                            <label>Кількість:</label>
                            <input type='number' name='quantity' min='1' max='100' placeholder='1' value={formData.quantity} onChange={handleChange} />

                            <label>Дата випробування:</label>
                            <input type='date' name='testDate' value={formData.testDate} onChange={handleChange} />

                            <select name='result' value={formData.result} onChange={handleChange}>
                                <option value="pass">Придатний</option>
                                <option value="fail">Непридатний</option>
                            </select>

                            <label>Наступне випробування:</label>
                            <input type='date' name='nextTestDate' value={formData.nextTestDate} onChange={handleChange} />

                            <input type='text' name='linkName' placeholder='Назва документу' value={formData.linkName} onChange={handleChange} />
                            <input type='url' name='link' placeholder='Посилання на документ' value={formData.link} onChange={handleChange} />

                            <button type='submit'>Створити {formData.quantity > 1 ? `(${formData.quantity} шт.)` : ''}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Bulk actions bar */}
            {isSelecting && isExpanded && (
                <div className='bulk-actions-bar'>
                    <label className='bulk-select-all' onClick={selectAll}>
                        {selectedIds.length === (testList.TestItems?.length || 0)
                            ? <MdCheckBox />
                            : <MdCheckBoxOutlineBlank />}
                        <span>Обрати всі</span>
                    </label>
                    <span className='bulk-count'>Обрано: {selectedIds.length}</span>
                    {selectedIds.length > 0 && (
                        <button className='bulk-update-btn' onClick={() => setShowBulkModal(true)}>
                            Оновити обрані ({selectedIds.length})
                        </button>
                    )}
                </div>
            )}

            {/* Bulk update modal */}
            {showBulkModal && (
                <div className='modal-overlay' onClick={() => setShowBulkModal(false)}>
                    <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Масове оновлення ({selectedIds.length} елементів)</h3>
                            <button className="close-btn" onClick={() => setShowBulkModal(false)}>✕</button>
                        </div>
                        <form className='add-form' onSubmit={handleBulkSubmit}>
                            <label>Дата випробування:</label>
                            <input type='date' name='testDate' value={bulkFormData.testDate} onChange={handleBulkChange} />

                            <label>Результат:</label>
                            <select name='result' value={bulkFormData.result} onChange={handleBulkChange}>
                                <option value="pass">Придатний</option>
                                <option value="fail">Непридатний</option>
                            </select>

                            <label>Наступне випробування:</label>
                            <input type='date' name='nextTestDate' value={bulkFormData.nextTestDate} onChange={handleBulkChange} />

                            <input type='text' name='linkName' placeholder='Назва документу' value={bulkFormData.linkName} onChange={handleBulkChange} />
                            <input type='url' name='link' placeholder='Посилання на документ' value={bulkFormData.link} onChange={handleBulkChange} />

                            <button type='submit' disabled={isBulkSaving}>
                                {isBulkSaving ? 'Збереження...' : `Оновити ${selectedIds.length} елементів`}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showIntervalModal && (
                <div className='modal-overlay' onClick={() => setShowIntervalModal(false)}>
                    <div className='modal-content' onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
                        <div className='modal-header'>
                            <h3>Інтервал для «{testList.name}»</h3>
                            <button className='close-btn' onClick={() => setShowIntervalModal(false)}>✕</button>
                        </div>
                        <form className='add-form' onSubmit={handleSaveInterval}>
                            <label>Періодичність випробувань (місяці):</label>
                            <input
                                type='number'
                                min='0'
                                step='1'
                                value={intervalDraft}
                                onChange={(e) => setIntervalDraft(e.target.value)}
                                placeholder='напр. 12'
                                autoFocus
                            />
                            <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', margin: '0.25rem 0 0.75rem' }}>
                                Коли встановлено — поле «наступне випробування» автоматично заповнюється при зміні дати випробування. Залиште порожнім, щоб вимкнути авто-розрахунок.
                            </p>
                            <button type='submit' disabled={isSavingInterval}>
                                {isSavingInterval ? 'Збереження...' : 'Зберегти'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className={`item-body ${isExpanded ? 'expanded' : ''}`}>
                {testList.TestItems?.length > 0 ? (
                    [...testList.TestItems].sort((a, b) => a.id - b.id).filter(i => !searchQuery || testList.name?.toLowerCase().includes(searchQuery.toLowerCase()) || i.name?.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                        <div key={item.id} className='item-row-container'>
                            {editingItemId === item.id ? (
                                <form className='edit-form' onSubmit={(e) => handleUpdateSubmit(e, item.id)}>
                                    <input type='text' name='inventoryNumber' placeholder='Інв. номер' value={editFormData.inventoryNumber} onChange={handleEditChange} />
                                    <input type='text' name='name' placeholder='Назва елементу' value={editFormData.name} onChange={handleEditChange} required />
                                    <input type='date' name='testDate' value={editFormData.testDate} onChange={handleEditChange} />
                                    <select name='result' value={editFormData.result} onChange={handleEditChange}>
                                        <option value="pass">Придатний</option>
                                        <option value="fail">Непридатний</option>
                                    </select>
                                    <input type='date' name='nextTestDate' value={editFormData.nextTestDate} onChange={handleEditChange} />
                                    <div className='link-box'>
                                        <input type='text' name='linkName' placeholder='Назва документу' value={editFormData.linkName} onChange={handleEditChange}></input>
                                        <input type='url' name='link' placeholder='Посилання на документ' value={editFormData.link} onChange={handleEditChange} />
                                    </div>


                                    <div className='edit-actions'>
                                        <button type='submit' className='save-btn'>Зберегти</button>
                                        <button type='button' className='cancel-btn' onClick={handleCancelEdit}>відмінити</button>
                                        <button
                                            type='button'
                                            className='archive-btn'
                                            onClick={() => handleOpenArchive(item)}
                                            style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            Списати
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className={`item-row ${item.result === 'pass' ? 'item-pass' : item.result === 'fail' ? 'item-fail' : ''}`}>
                                    {isSelecting && (
                                        <span className='bulk-checkbox' onClick={() => toggleItemSelection(item.id)}>
                                            {selectedIds.includes(item.id)
                                                ? <MdCheckBox className='checked' />
                                                : <MdCheckBoxOutlineBlank />}
                                        </span>
                                    )}
                                    <span style={{ flex: '0.5' }} title="Інвентарний номер">{item.inventoryNumber || '—'}</span>
                                    <span style={{ flex: '1.5' }} title="Назва">{item.name}</span>

                                    <span style={{ flex: '1' }} title="Дата випробування">{formatDate(item.testDate)}</span>
                                    <span style={{ flex: '0.5' }} title="Результат">{item.result === 'pass' ? 'Придатний' : item.result === 'fail' ? 'Непридатний' : item.result}</span>
                                    <span style={{ flex: '1' }} title="Наступне випробування">{formatDate(item.nextTestDate)}</span>
                                    <span className="link-cell" style={{ flex: '0.5' }}>
                                        {item.link ? <a href={item.link} target="_blank" rel="noreferrer" style={{ color: 'var(--navy)', textDecoration: 'underline' }}>{item.linkName || 'Акт'}</a> : '—'}
                                    </span>
                                    {!isSelecting && (
                                        <button className='update-btn' onClick={() => handleEditClick(item)}>
                                            <MdUpdate />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p>Частина поки не має такого обладнання</p>
                )}
            </div>

            {/* Archive Modal */}
            <ArchiveModal
                isOpen={!!itemToArchive}
                itemName={itemToArchive?.name}
                onClose={() => setItemToArchive(null)}
                onConfirm={handleConfirmArchive}
            />
        </div>

    )
}

export default ItemTest
