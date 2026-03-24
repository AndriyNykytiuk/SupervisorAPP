import React, { useState } from 'react'
import { MdUpdate } from "react-icons/md";
import { FaArrowDownWideShort } from "react-icons/fa6";
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";
import { createTestItem, updateTestItem, bulkUpdateTestItems } from '../api/services.js';
import '../scss/itemtest.scss'

const ItemTest = ({ testList, selectedBrigade, onItemCreated }) => {
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
    const [isBulkSaving, setIsBulkSaving] = useState(false)

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
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value })
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
        setBulkFormData({ ...bulkFormData, [e.target.name]: e.target.value })
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

    return (
        <div className='item-wrapper'>
            <div className='item-header'>
                <div className='item-header-title'>
                    <div className='item-header-title-add' onClick={() => setIsExpanded(!isExpanded)} style={{ cursor: 'pointer', flex: 1, userSelect: 'none' }}>
                        <h2>{testList.name} - {testList.TestItems?.length} шт.</h2>
                        <FaArrowDownWideShort className='arrow-down' />
                    </div>

                    <div className='item-header-actions'>
                        {isExpanded && testList.TestItems?.length > 0 && (
                            <h3 className={`bulk-select-btn ${isSelecting ? 'active' : ''}`} onClick={toggleSelectMode}>
                                {isSelecting ? '✕ Скасувати' : '☑ Обрати'}
                            </h3>
                        )}
                        {isExpanded && (
                            <h3 className='add-btn' onClick={() => setShowForm(!showForm)}>
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

            <div className={`item-body ${isExpanded ? 'expanded' : ''}`}>
                {testList.TestItems?.length > 0 ? (
                    testList.TestItems.map((item) => (
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
        </div>
            
    )
}

export default ItemTest
