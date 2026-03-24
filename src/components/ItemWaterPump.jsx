import React, { useState, useEffect } from 'react'
import { MdUpdate, MdDelete } from "react-icons/md"
import { fetchWaterPumpsByBrigade, createWaterPump, updateWaterPump, deleteWaterPump, archiveEquipmentItem } from '../api/services.js';
import ArchiveModal from './ArchiveModal.jsx'
import '../scss/itemwaterpump.scss'

const ItemWaterPump = ({ selectedBrigade }) => {
    const [elements, setElements] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [editingItemId, setEditingItemId] = useState(null)

    const initialFormState = {
        name: '',
        yearOfPurchase: '',
        powerOf: '',
        placeOfStorage: '',
        notes: ''
    }

    const [formData, setFormData] = useState(initialFormState)
    const [editFormData, setEditFormData] = useState({})
    
    // ── Archive state ──
    const [itemToArchive, setItemToArchive] = useState(null)

    const fetchData = async () => {
        if (!selectedBrigade) return
        try {
            const data = await fetchWaterPumpsByBrigade(selectedBrigade);
            setElements(data)
        } catch (err) {
            console.error('Failed to fetch Water Pumps:', err)
        }
    }

    useEffect(() => {
        fetchData()
    }, [selectedBrigade])

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
            await createWaterPump({
                name: formData.name,
                yearOfPurchase: formData.yearOfPurchase ? parseInt(formData.yearOfPurchase, 10) : null,
                powerOf: formData.powerOf ? parseFloat(formData.powerOf) : null,
                placeOfStorage: formData.placeOfStorage,
                notes: formData.notes,
                brigadeId: selectedBrigade,
            });

            setFormData(initialFormState)
            setShowForm(false)
            fetchData()
        } catch (err) {
            console.error('Failed to create Water Pump:', err)
        }
    }

    const handleUpdateSubmit = async (e, id) => {
        e.preventDefault()
        try {
            await updateWaterPump(id, {
                name: editFormData.name,
                yearOfPurchase: editFormData.yearOfPurchase ? parseInt(editFormData.yearOfPurchase, 10) : null,
                powerOf: editFormData.powerOf ? parseFloat(editFormData.powerOf) : null,
                placeOfStorage: editFormData.placeOfStorage,
                notes: editFormData.notes,
            });

            setEditingItemId(null)
            fetchData()
        } catch (err) {
            console.error('Failed to update Water Pump:', err)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Дійсно видалити цю мотопомпу?")) return;
        try {
            await deleteWaterPump(id);
            fetchData()
        } catch (err) {
            console.error('Failed to delete Water Pump:', err)
        }
    }

    const handleEditClick = (item) => {
        setEditingItemId(item.id)
        setEditFormData({
            name: item.name || '',
            yearOfPurchase: item.yearOfPurchase || '',
            powerOf: item.powerOf || '',
            placeOfStorage: item.placeOfStorage || '',
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
                equipmentType: 'WaterPumps',
                originalId: itemToArchive.id,
                ...archiveData
            })
            fetchData()
            if (editingItemId === itemToArchive.id) {
                handleCancelEdit()
            }
        } catch (error) {
            console.error('Failed to archive Water Pump:', error)
            throw error 
        }
    }

    if (!selectedBrigade) return null;

    return (
        <div className='item-waterpump-wrapper'>
            <div className='item-header'>
                <div className='item-header-title'>
                    <h2>Мотопомпи - {elements?.length} шт.</h2>
                    <h3 className='add-btn' onClick={() => setShowForm(!showForm)}>
                        {showForm ? '✕' : '+ додати'}
                    </h3>
                </div>
                {elements?.length > 0 && (
                    <div className='item-header-row water-pump-row'>
                        <span>назва обладнання</span>
                        <span>рік закупівлі</span>
                        <span>потужність (л/с)</span>
                        <span>місце зберігання</span>
                        <span>примітки</span>
                        <span>Оновити дані</span>
                    </div>
                )}
            </div>

            {showForm && (
                <div className='modal-overlay' onClick={() => setShowForm(false)}>
                    <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Додати мотопомпу</h3>
                            <button className="close-btn" onClick={() => setShowForm(false)}>✕</button>
                        </div>
                        <form className='add-form' onSubmit={handleCreate}>
                            <input type='text' name='name' placeholder='Назва обладнання' value={formData.name} onChange={handleChange} required />
                            <input type='number' name='yearOfPurchase' placeholder='Рік закупівлі' value={formData.yearOfPurchase} onChange={handleChange} required />
                            <input type='number' step='0.1' name='powerOf' placeholder='Потужність (л/с)' value={formData.powerOf} onChange={handleChange} required />
                            <select name='placeOfStorage' value={formData.placeOfStorage} onChange={handleChange} required>
                                <option value="" disabled>Оберіть місце зберігання</option>
                                <option value="На техніці">На техніці</option>
                                <option value="Склад">Склад</option>
                                <option value="На автомобілях зведеного загону">На автомобілях зведеного загону</option>
                                <option value="Склад зведеного загону">Склад зведеного загону</option>
                                <option value="Мат. Резерв">Мат. Резерв</option>
                                <option value="Ремонт">Ремонт</option>
                            </select>
                            <input type='text' name='notes' placeholder='Примітки' value={formData.notes} onChange={handleChange} />

                            <button type='submit'>Створити</button>
                        </form>
                    </div>
                </div>
            )}

            <div className='item-body'>
                {elements?.length > 0 ? (
                    elements.map((item) => (
                        <div key={item.id} className='item-row-container'>
                            {editingItemId === item.id ? (
                                <form className='edit-form' onSubmit={(e) => handleUpdateSubmit(e, item.id)}>
                                    <input type='text' name='name' placeholder='Назва' value={editFormData.name} onChange={handleEditChange} required />
                                    <input type='number' name='yearOfPurchase' placeholder='Рік' value={editFormData.yearOfPurchase} onChange={handleEditChange} required />
                                    <input type='number' step='0.1' name='powerOf' placeholder='Потужність' value={editFormData.powerOf} onChange={handleEditChange} required />
                                    <select name='placeOfStorage' value={editFormData.placeOfStorage} onChange={handleEditChange} required>
                                        <option value="На техніці">На техніці</option>
                                        <option value="Склад">Склад</option>
                                        <option value="На автомобілях зведеного загону">На автомобілях зведеного загону</option>
                                        <option value="Склад зведеного загону">Склад зведеного загону</option>
                                        <option value="Мат. Резерв">Мат. Резерв</option>
                                        <option value="Ремонт">Ремонт</option>
                                    </select>
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
                                <div className='item-row water-pump-row'>
                                    <span style={{ flex: '1.5' }} title="Назва">{item.name}</span>
                                    <span style={{ flex: '0.5' }} title="Рік закупівлі">{item.yearOfPurchase || '—'}</span>
                                    <span style={{ flex: '0.8' }} title="Потужність (л/с)">{item.powerOf || '—'}</span>
                                    <span style={{ flex: '1.5' }} title="Місце зберігання">{item.placeOfStorage || '—'}</span>
                                    <span style={{ flex: '1.5' }} title="Примітки">{item.notes || '—'}</span>

                                    <span className="action-buttons-wrap" title="оновити дані" style={{ display: 'flex', justifyContent: 'center' }}>
                                        <button className='update-btn' onClick={() => handleEditClick(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--navy)' }}>
                                            <MdUpdate size={20} />
                                        </button>
                                    </span>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p style={{ padding: '1rem', color: 'var(--gray-600)' }}>Частина поки не має таких мотопомп</p>
                )}
            </div>
            
            <ArchiveModal 
                isOpen={!!itemToArchive}
                itemName={itemToArchive?.name}
                onClose={() => setItemToArchive(null)}
                onConfirm={handleConfirmArchive}
            />
        </div>
    )
}

export default ItemWaterPump
