import React, { useState, useEffect, useRef } from 'react'
import { MdUpdate, MdDelete } from "react-icons/md"
import { fetchSpecialToolsByBrigade, createSpecialTool, updateSpecialTool, deleteSpecialTool, archiveEquipmentItem, transferItems } from '../api/services.js'
import { toast } from 'react-toastify';
import ArchiveModal from './ArchiveModal.jsx'
import '../scss/specialtool.scss'

const ItemSpecialTool = ({ selectedBrigade, searchQuery = '', transferBrigades = [] }) => {
    const [elements, setElements] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [editingItemId, setEditingItemId] = useState(null)
    const [isExpanded, setIsExpanded] = useState(false)
    const toggleExpand = () => setIsExpanded(prev => !prev)
    const wrapperRef = useRef(null)

    const initialFormState = {
        name: '',
        quantity: '',
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
            const data = await fetchSpecialToolsByBrigade(selectedBrigade)
            setElements(data)
        } catch (err) {
            console.error('Failed to fetch special tools:', err)
        }
    }

    useEffect(() => {
        fetchData();
    }, [selectedBrigade]);

    useEffect(() => {
        if (searchQuery) {
            setIsExpanded(true);
            const hasMatch = elements?.some(i => i.name?.toLowerCase().includes(searchQuery.toLowerCase()));
            if (hasMatch) {
                setTimeout(() => {
                    wrapperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        }
    }, [searchQuery, elements]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value })
    }

    const handleCreate = async (e) => {
        e.preventDefault()

        try {
            await createSpecialTool({
                name: formData.name,
                quantity: formData.quantity ? parseInt(formData.quantity, 10) : 0,
                placeOfStorage: formData.placeOfStorage,
                notes: formData.notes,
                brigadeId: selectedBrigade,
            })

            setFormData(initialFormState)
            setShowForm(false)
            toast.success('Спеціальне обладнання успішно додано!');
            fetchData()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка при збереженні')
            console.error('Failed to create special tool:', err)
        }
    }

    const handleUpdateSubmit = async (e, id) => {
        e.preventDefault()
        try {
            await updateSpecialTool(id, {
                name: editFormData.name,
                quantity: editFormData.quantity ? parseInt(editFormData.quantity, 10) : 0,
                placeOfStorage: editFormData.placeOfStorage,
                notes: editFormData.notes,
            })

            if (editFormData.transferToBrigadeId) {
                await transferItems({
                    specialToolIds: [id],
                    toBrigadeId: parseInt(editFormData.transferToBrigadeId, 10)
                });
                toast.success('Обладнання передано!');
            } else {
                toast.success('Дані успішно оновлено!');
            }

            setEditingItemId(null)
            fetchData()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка при оновленні чи передачі')
            console.error('Failed to update special tool:', err)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Дійсно видалити цей запис?")) return;
        try {
            await deleteSpecialTool(id)
            toast.success('Запис успішно видалено!');
            fetchData()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка при видаленні')
            console.error('Failed to delete special tool:', err)
        }
    }

    const handleEditClick = (item) => {
        setEditingItemId(item.id)
        setEditFormData({
            name: item.name || '',
            quantity: item.quantity || 0,
            placeOfStorage: item.placeOfStorage || '',
            notes: item.notes || '',
            transferToBrigadeId: ''
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
                equipmentType: 'SpecialTool', 
                originalId: itemToArchive.id,
                ...archiveData
            })
            fetchData()
            if (editingItemId === itemToArchive.id) {
                handleCancelEdit()
            }
        } catch (error) {
            console.error('Failed to archive Special Tool:', error)
            throw error 
        }
    }

    if (!selectedBrigade) return null;

    // Hide component if search query doesn't match list name or any item name
    const listNameMatch = !searchQuery || 
        'Спеціальне обладнання'.toLowerCase().includes(searchQuery.toLowerCase());
    const hasMatchingItems = elements?.some(i => i.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    if (searchQuery && !listNameMatch && !hasMatchingItems) return null;

    return (
        <div className='item-specialtool-wrapper' ref={wrapperRef}>
            <div className='item-header' onClick={toggleExpand} style={{ cursor: 'pointer' }}>
                <div className='item-header-title'>
                    <h2>Спеціальне обладнання - {elements?.length || 0}</h2>
                    <h3 className='add-btn' onClick={(e) => { e.stopPropagation(); setShowForm(!showForm); }}>
                        {showForm ? '✕' : '+ додати'}
                    </h3>
                </div>
                {isExpanded && elements?.length > 0 && (
                    <div className='item-header-row'>
                        <span title="Назва">НАЗВА</span>
                        <span title="Кількість">КІЛЬКІСТЬ</span>
                        <span title="Місце зберігання">МІСЦЕ ЗБЕРІГАННЯ</span>
                        <span title="Примітки">ПРИМІТКИ</span>
                        <span>ДІЇ</span>
                    </div>
                )}
            </div>

            {showForm && (
                <div className='modal-overlay' onClick={() => setShowForm(false)}>
                    <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Додати спеціальне обладнання</h3>
                            <button className="close-btn" onClick={() => setShowForm(false)}>✕</button>
                        </div>
                        <form className='add-form' onSubmit={handleCreate}>
                            <label>Назва</label>
                            <input type='text' name='name' value={formData.name} onChange={handleChange} required />
                            
                            <label>Кількість</label>
                            <input type='number' name='quantity' value={formData.quantity} onChange={handleChange} min="0" required />
                            
                            <label>Місце зберігання</label>
                            <input type='text' name='placeOfStorage' value={formData.placeOfStorage} onChange={handleChange} />
                            
                            <label>Примітки</label>
                            <input type='text' name='notes' value={formData.notes} onChange={handleChange} />

                            <button type='submit'>Створити</button>
                        </form>
                    </div>
                </div>
            )}

            <div className={`item-body ${isExpanded ? 'expanded' : ''}`}>
                {isExpanded && (elements?.length > 0 ? (
                    elements.filter(i => listNameMatch || i.name?.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                        <div key={item.id} className='item-row-container'>
                            {editingItemId === item.id ? (
                                <form className='edit-form' onSubmit={(e) => handleUpdateSubmit(e, item.id)}>
                                    <input type='text' name='name' value={editFormData.name} onChange={handleEditChange} required placeholder="Назва" />
                                    <input type='number' name='quantity' value={editFormData.quantity} onChange={handleEditChange} min="0" required placeholder="Кількість" />
                                    <input type='text' name='placeOfStorage' value={editFormData.placeOfStorage} onChange={handleEditChange} placeholder="Місце зберігання" />
                                    <input type='text' name='notes' value={editFormData.notes} onChange={handleEditChange} placeholder="Примітки" />

                                    <div className='edit-actions'>
                                        {transferBrigades && transferBrigades.length > 0 && (
                                            <select 
                                                name='transferToBrigadeId' 
                                                value={editFormData.transferToBrigadeId || ''} 
                                                onChange={handleEditChange}
                                                style={{ border: '2px solid var(--accent)', backgroundColor: '#fff8dc' }}
                                            >
                                                <option value="">-- Передача до іншого підрозділу (без змін) --</option>
                                                {transferBrigades.map(det => (
                                                    <optgroup key={`det_${det.id}`} label={det.name}>
                                                        {det.Brigades?.filter(b => b.id !== selectedBrigade).map(b => (
                                                            <option key={`brig_${b.id}`} value={b.id}>{b.name}</option>
                                                        ))}
                                                    </optgroup>
                                                ))}
                                            </select>
                                        )}
                                        <button type='submit' className='save-btn'>Зберегти</button>
                                        <button 
                                            type='button' 
                                            className='archive-btn' 
                                            onClick={() => handleOpenArchive(item)}
                                            style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            Списати
                                        </button>
                                        <button type='button' className='cancel-btn' onClick={handleCancelEdit}>відмінити</button>
                                    </div>
                                </form>
                            ) : (
                                <div className='item-row'>
                                    <span title="Назва">{item.name}</span>
                                    <span title="Кількість">{item.quantity}</span>
                                    <span title="Місце зберігання">{item.placeOfStorage || '-'}</span>
                                    <span title="Примітки">{item.notes || '-'}</span>

                                    <span className="action-buttons-wrap">
                                        <button className='update-btn' onClick={() => handleEditClick(item)} title="Редагувати">
                                            <MdUpdate size={20} />
                                        </button>
                                    </span>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p style={{ padding: '1rem', color: 'var(--gray-600)' }}>Частина поки немає спеціального обладнання</p>
                ))}
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

export default ItemSpecialTool
