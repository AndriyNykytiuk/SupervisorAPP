import React, { useState } from 'react'
import { MdUpdate } from "react-icons/md"
import { createToolItem, updateToolItem, archiveEquipmentItem } from '../api/services.js';
import ArchiveModal from './ArchiveModal.jsx'
import '../scss/itemtool.scss'

const ItemTool = ({ toolList, selectedBrigade, onItemCreated }) => {
    const [showForm, setShowForm] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const [editingItemId, setEditingItemId] = useState(null)

    const initialFormState = {
        name: '',
        yearOfPurchase: '',
        powerfull: '',
        storagePlace: '',
        quantity: 0,
        notes: ''
    }

    const [formData, setFormData] = useState(initialFormState)
    const [editFormData, setEditFormData] = useState({})
    
    // ── Archive state ──
    const [itemToArchive, setItemToArchive] = useState(null)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value })
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        if (!formData.name.trim()) return

        try {
            const res = await createToolItem({
                name: formData.name,
                yearOfPurchase: formData.yearOfPurchase ? parseInt(formData.yearOfPurchase, 10) : null,
                powerfull: formData.powerfull ? parseInt(formData.powerfull, 10) : null,
                storagePlace: formData.storagePlace,
                quantity: formData.quantity ? parseInt(formData.quantity, 10) : 0,
                notes: formData.notes,
                toolListId: toolList.id,
                brigadeId: selectedBrigade,
            });

            setFormData(initialFormState)
            setShowForm(false)
            onItemCreated()
        } catch (err) {
            console.error('Failed to create tool item:', err)
        }
    }

    const handleUpdateSubmit = async (e, id) => {
        e.preventDefault()
        try {
            await updateToolItem(id, {
                name: editFormData.name,
                yearOfPurchase: editFormData.yearOfPurchase ? parseInt(editFormData.yearOfPurchase, 10) : null,
                powerfull: editFormData.powerfull ? parseInt(editFormData.powerfull, 10) : null,
                storagePlace: editFormData.storagePlace,
                quantity: editFormData.quantity ? parseInt(editFormData.quantity, 10) : 0,
                notes: editFormData.notes,
            });

            setEditingItemId(null)
            onItemCreated()
        } catch (err) {
            console.error('Failed to update tool item:', err)
        }
    }

    const handleEditClick = (item) => {
        setEditingItemId(item.id)
        setEditFormData({
            name: item.name || '',
            yearOfPurchase: item.yearOfPurchase || '',
            powerfull: item.powerfull || '',
            storagePlace: item.storagePlace || '',
            quantity: item.quantity || 0,
            notes: item.notes || ''
        })
    }

    const handleCancelEdit = () => {
        setEditingItemId(null)
        setEditFormData({})
    }

    // ── Archive handlers ──
    const handleOpenArchive = (item) => {
        setItemToArchive(item)
    }

    const handleConfirmArchive = async (archiveData) => {
        if (!itemToArchive) return
        try {
            await archiveEquipmentItem({
                equipmentType: 'ToolItem',
                originalId: itemToArchive.id,
                ...archiveData
            })
            
            // Оновити список
            onItemCreated()
            
            // Якщо був відкритий режим редагування - закрити його
            if (editingItemId === itemToArchive.id) {
                handleCancelEdit()
            }
        } catch (error) {
            console.error('Failed to archive ToolItem:', error)
            throw error 
        }
    }

    return (
        <div className='item-tool-wrapper'>
            <div className='item-header'>
                <div className='item-header-title'>
                    <div className='item-header-title-add'>
                        <h2>{toolList.name} - {toolList.ToolItems?.length} шт.</h2>
                        <span onClick={() => setIsExpanded(!isExpanded)} style={{ transition: 'transform 0.2s', transform: isExpanded ? 'rotate(45deg)' : 'rotate(0deg)' }}>+</span>
                    </div>
                    <h3 className='add-btn' onClick={() => setShowForm(!showForm)}>
                        {showForm ? '✕' : '+ додати'}
                    </h3>
                </div>
                {isExpanded && toolList.ToolItems?.length > 0 && (
                    <div className='item-header-row'>
                        <span>назва обладнання</span>
                        <span>рік закупівлі</span>
                        <span>потужність</span>
                        <span>місце зберігання</span>
                        <span>примітки</span>
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
                            <input type='text' name='name' placeholder='Назва обладнання' value={formData.name} onChange={handleChange} required />
                            <input type='number' name='yearOfPurchase' placeholder='Рік закупівлі' value={formData.yearOfPurchase} onChange={handleChange} />
                            <input type='number' name='powerfull' placeholder='Потужність' value={formData.powerfull} onChange={handleChange} />
                            <input type='text' name='storagePlace' placeholder='Місце зберігання' value={formData.storagePlace} onChange={handleChange} />
                            <input type='text' name='notes' placeholder='Примітки' value={formData.notes} onChange={handleChange} />

                            <button type='submit'>Створити</button>
                        </form>
                    </div>
                </div>
            )}

            <div className={`item-body ${isExpanded ? 'expanded' : ''}`}>
                {toolList.ToolItems?.length > 0 ? (
                    toolList.ToolItems.map((item) => (
                        <div key={item.id} className='item-row-container'>
                            {editingItemId === item.id ? (
                                <form className='edit-form' onSubmit={(e) => handleUpdateSubmit(e, item.id)}>
                                    <input type='text' name='name' placeholder='Назва' value={editFormData.name} onChange={handleEditChange} required />
                                    <input type='number' name='yearOfPurchase' placeholder='Рік' value={editFormData.yearOfPurchase} onChange={handleEditChange} />
                                    <input type='number' name='powerfull' placeholder='Потужність' value={editFormData.powerfull} onChange={handleEditChange} />
                                    <input type='text' name='storagePlace' placeholder='Місце зберігання' value={editFormData.storagePlace} onChange={handleEditChange} />
                                    <input type='text' name='notes' placeholder='Примітки' value={editFormData.notes} onChange={handleEditChange} />
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
                                <div className='item-row'>
                                    <span style={{ flex: '1.5' }} title="Назва">{item.name}</span>
                                    <span style={{ flex: '0.5' }} title="Рік закупівлі">{item.yearOfPurchase || '—'}</span>
                                    <span style={{ flex: '0.8' }} title="Потужність">{item.powerfull || '—'}</span>
                                    <span style={{ flex: '1' }} title="Місце зберігання">{item.storagePlace || '—'}</span>
                                    <span style={{ flex: '1.5' }} title="Примітки">{item.notes || '—'}</span>

                                    <button className='update-btn' onClick={() => handleEditClick(item)}>
                                        <MdUpdate />
                                    </button>
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

export default ItemTool
