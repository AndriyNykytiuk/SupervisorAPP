import React, { useState, useEffect, useRef } from 'react'
import { MdUpdate } from 'react-icons/md'
import { toast } from 'react-toastify'
import { archiveEquipmentItem, transferItems } from '../api/services.js'
import ArchiveModal from './ArchiveModal.jsx'
import '../scss/specialtool.scss'

const ItemSimpleTool = ({
    selectedBrigade,
    searchQuery = '',
    title,
    equipmentType,
    fetchFn,
    createFn,
    updateFn,
    transferBrigades = [],
    transferKey,
}) => {
    const [elements, setElements] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [editingItemId, setEditingItemId] = useState(null)
    const [isExpanded, setIsExpanded] = useState(false)
    const wrapperRef = useRef(null)

    const initialFormState = {
        name: '',
        yearOfPurchase: '',
        placeOfStorage: '',
        notes: '',
    }

    const [formData, setFormData] = useState(initialFormState)
    const [editFormData, setEditFormData] = useState({})
    const [itemToArchive, setItemToArchive] = useState(null)

    const fetchData = async () => {
        if (!selectedBrigade) return
        try {
            const data = await fetchFn(selectedBrigade)
            setElements(data)
        } catch (err) {
            console.error(`Failed to fetch ${equipmentType}:`, err)
        }
    }

    useEffect(() => {
        fetchData()
    }, [selectedBrigade])

    useEffect(() => {
        if (searchQuery) {
            setIsExpanded(true)
            const hasMatch = elements?.some(i =>
                i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                i.yearOfPurchase?.toString().includes(searchQuery.toLowerCase())
            )
            if (hasMatch) {
                setTimeout(() => {
                    wrapperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }, 300)
            }
        }
    }, [searchQuery, elements])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value })
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        try {
            await createFn({
                name: formData.name,
                yearOfPurchase: formData.yearOfPurchase ? parseInt(formData.yearOfPurchase, 10) : null,
                placeOfStorage: formData.placeOfStorage,
                notes: formData.notes,
                brigadeId: selectedBrigade,
            })
            setFormData(initialFormState)
            setShowForm(false)
            toast.success('Запис успішно додано!')
            fetchData()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка при збереженні')
            console.error(`Failed to create ${equipmentType}:`, err)
        }
    }

    const handleUpdateSubmit = async (e, id) => {
        e.preventDefault()
        try {
            await updateFn(id, {
                name: editFormData.name,
                yearOfPurchase: editFormData.yearOfPurchase ? parseInt(editFormData.yearOfPurchase, 10) : null,
                placeOfStorage: editFormData.placeOfStorage,
                notes: editFormData.notes,
            })

            if (editFormData.transferToBrigadeId && transferKey) {
                await transferItems({
                    [transferKey]: [id],
                    toBrigadeId: parseInt(editFormData.transferToBrigadeId, 10),
                })
                toast.success('Обладнання передано!')
            } else {
                toast.success('Дані успішно оновлено!')
            }

            setEditingItemId(null)
            fetchData()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка при оновленні чи передачі')
            console.error(`Failed to update ${equipmentType}:`, err)
        }
    }

    const handleEditClick = (item) => {
        setEditingItemId(item.id)
        setEditFormData({
            name: item.name || '',
            yearOfPurchase: item.yearOfPurchase || '',
            placeOfStorage: item.placeOfStorage || '',
            notes: item.notes || '',
            transferToBrigadeId: '',
        })
    }

    const handleCancelEdit = () => {
        setEditingItemId(null)
        setEditFormData({})
    }

    const handleOpenArchive = (item) => {
        setItemToArchive(item)
    }

    const handleConfirmArchive = async (archiveData) => {
        if (!itemToArchive) return
        try {
            await archiveEquipmentItem({
                equipmentType,
                originalId: itemToArchive.id,
                ...archiveData,
            })
            fetchData()
            if (editingItemId === itemToArchive.id) handleCancelEdit()
        } catch (error) {
            console.error(`Failed to archive ${equipmentType}:`, error)
            throw error
        }
    }

    if (!selectedBrigade) return null

    const listNameMatch = !searchQuery || title.toLowerCase().includes(searchQuery.toLowerCase())
    const hasMatchingItems = elements?.some(i =>
        i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.yearOfPurchase?.toString().includes(searchQuery.toLowerCase())
    )
    if (searchQuery && !listNameMatch && !hasMatchingItems) return null

    return (
        <div className='item-specialtool-wrapper' ref={wrapperRef}>
            <div className='item-header' onClick={() => setIsExpanded(prev => !prev)} style={{ cursor: 'pointer' }}>
                <div className='item-header-title'>
                    <h2>{title} - {elements?.length || 0}</h2>
                    <h3 className='add-btn' onClick={(e) => { e.stopPropagation(); setShowForm(!showForm) }}>
                        {showForm ? '✕' : '+ додати'}
                    </h3>
                </div>
                {isExpanded && elements?.length > 0 && (
                    <div className='item-header-row'>
                        <span title='Назва'>НАЗВА</span>
                        <span title='Рік отримання'>РІК ОТРИМАННЯ</span>
                        <span title='Місцезнаходження'>МІСЦЕЗНАХОДЖЕННЯ</span>
                        <span title='Примітки'>ПРИМІТКИ</span>
                        <span>ДІЇ</span>
                    </div>
                )}
            </div>

            {showForm && (
                <div className='modal-overlay' onClick={() => setShowForm(false)}>
                    <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                        <div className='modal-header'>
                            <h3>Додати: {title}</h3>
                            <button className='close-btn' onClick={() => setShowForm(false)}>✕</button>
                        </div>
                        <form className='add-form' onSubmit={handleCreate}>
                            <label>Назва</label>
                            <input type='text' name='name' value={formData.name} onChange={handleChange} required />

                            <label>Рік отримання</label>
                            <input type='number' name='yearOfPurchase' value={formData.yearOfPurchase} onChange={handleChange} min='1900' max='2100' />

                            <label>Місцезнаходження</label>
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
                    elements.filter(i =>
                        listNameMatch ||
                        i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        i.yearOfPurchase?.toString().includes(searchQuery.toLowerCase())
                    ).map((item) => (
                        <div key={item.id} className='item-row-container'>
                            {editingItemId === item.id ? (
                                <form className='edit-form' onSubmit={(e) => handleUpdateSubmit(e, item.id)}>
                                    <input type='text' name='name' value={editFormData.name} onChange={handleEditChange} required placeholder='Назва' />
                                    <input type='number' name='yearOfPurchase' value={editFormData.yearOfPurchase} onChange={handleEditChange} placeholder='Рік отримання' min='1900' max='2100' />
                                    <input type='text' name='placeOfStorage' value={editFormData.placeOfStorage} onChange={handleEditChange} placeholder='Місцезнаходження' />
                                    <input type='text' name='notes' value={editFormData.notes} onChange={handleEditChange} placeholder='Примітки' />

                                    <div className='edit-actions'>
                                        {transferKey && transferBrigades && transferBrigades.length > 0 && (
                                            <select
                                                name='transferToBrigadeId'
                                                value={editFormData.transferToBrigadeId || ''}
                                                onChange={handleEditChange}
                                                style={{ border: '2px solid var(--accent)', backgroundColor: '#fff8dc' }}
                                            >
                                                <option value=''>-- Передача до іншого підрозділу (без змін) --</option>
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
                                    <span title='Назва'>{item.name}</span>
                                    <span title='Рік отримання'>{item.yearOfPurchase || '-'}</span>
                                    <span title='Місцезнаходження'>{item.placeOfStorage || '-'}</span>
                                    <span title='Примітки'>{item.notes || '-'}</span>

                                    <span className='action-buttons-wrap'>
                                        <button className='update-btn' onClick={() => handleEditClick(item)} title='Редагувати'>
                                            <MdUpdate size={20} />
                                        </button>
                                    </span>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p style={{ padding: '1rem', color: 'var(--gray-600)' }}>Частина поки не має такого обладнання</p>
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

export default ItemSimpleTool
