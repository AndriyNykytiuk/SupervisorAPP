import React, { useState, useEffect, useRef } from 'react'
import { MdUpdate } from 'react-icons/md'
import { toast } from 'react-toastify'
import {
    fetchLightMastsByBrigade,
    createLightMast,
    updateLightMast,
    archiveEquipmentItem,
    transferItems,
} from '../api/services.js'
import ArchiveModal from './ArchiveModal.jsx'
import '../scss/specialtool.scss'

const initialFormState = {
    name: '',
    brand: '',
    yearOfPurchase: '',
    power: '',
    placeOfStorage: '',
    extensionCordsCount: '',
}

const ItemLightMast = ({ selectedBrigade, searchQuery = '', transferBrigades = [] }) => {
    const [elements, setElements] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [editingItemId, setEditingItemId] = useState(null)
    const [isExpanded, setIsExpanded] = useState(false)
    const wrapperRef = useRef(null)

    const [formData, setFormData] = useState(initialFormState)
    const [editFormData, setEditFormData] = useState({})
    const [itemToArchive, setItemToArchive] = useState(null)

    const fetchData = async () => {
        if (!selectedBrigade) return
        try {
            const data = await fetchLightMastsByBrigade(selectedBrigade)
            setElements(data || [])
        } catch (err) {
            console.error('Failed to fetch light masts:', err)
        }
    }

    useEffect(() => { fetchData() }, [selectedBrigade])

    useEffect(() => {
        if (searchQuery) {
            setIsExpanded(true)
            const hasMatch = elements?.some(i =>
                i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                i.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                i.power?.toString().includes(searchQuery.toLowerCase())
            )
            if (hasMatch) {
                setTimeout(() => {
                    wrapperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }, 300)
            }
        }
    }, [searchQuery, elements])

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })
    const handleEditChange = (e) => setEditFormData({ ...editFormData, [e.target.name]: e.target.value })

    const buildPayload = (data) => ({
        name: data.name,
        brand: data.brand || null,
        yearOfPurchase: data.yearOfPurchase ? parseInt(data.yearOfPurchase, 10) : null,
        power: data.power ? parseInt(data.power, 10) : null,
        placeOfStorage: data.placeOfStorage || null,
        extensionCordsCount: data.extensionCordsCount ? parseInt(data.extensionCordsCount, 10) : null,
    })

    const handleCreate = async (e) => {
        e.preventDefault()
        try {
            await createLightMast({ ...buildPayload(formData), brigadeId: selectedBrigade })
            setFormData(initialFormState)
            setShowForm(false)
            toast.success('Світлову мачту додано!')
            fetchData()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка при збереженні')
            console.error('Failed to create light mast:', err)
        }
    }

    const handleUpdateSubmit = async (e, id) => {
        e.preventDefault()
        try {
            await updateLightMast(id, buildPayload(editFormData))

            if (editFormData.transferToBrigadeId) {
                await transferItems({
                    lightMastIds: [id],
                    toBrigadeId: parseInt(editFormData.transferToBrigadeId, 10),
                })
                toast.success('Обладнання передано!')
            } else {
                toast.success('Дані оновлено!')
            }

            setEditingItemId(null)
            fetchData()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка при оновленні чи передачі')
            console.error('Failed to update light mast:', err)
        }
    }

    const handleEditClick = (item) => {
        setEditingItemId(item.id)
        setEditFormData({
            name: item.name || '',
            brand: item.brand || '',
            yearOfPurchase: item.yearOfPurchase || '',
            power: item.power || '',
            placeOfStorage: item.placeOfStorage || '',
            extensionCordsCount: item.extensionCordsCount ?? '',
            transferToBrigadeId: '',
        })
    }

    const handleCancelEdit = () => {
        setEditingItemId(null)
        setEditFormData({})
    }

    const handleOpenArchive = (item) => setItemToArchive(item)

    const handleConfirmArchive = async (archiveData) => {
        if (!itemToArchive) return
        try {
            await archiveEquipmentItem({
                equipmentType: 'LightMast',
                originalId: itemToArchive.id,
                ...archiveData,
            })
            fetchData()
            if (editingItemId === itemToArchive.id) handleCancelEdit()
        } catch (error) {
            console.error('Failed to archive LightMast:', error)
            throw error
        }
    }

    if (!selectedBrigade) return null

    const listNameMatch = !searchQuery || 'світлові мачти'.includes(searchQuery.toLowerCase())
    const hasMatchingItems = elements?.some(i =>
        i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.power?.toString().includes(searchQuery.toLowerCase())
    )
    if (searchQuery && !listNameMatch && !hasMatchingItems) return null

    return (
        <div className='item-specialtool-wrapper' ref={wrapperRef}>
            <div className='item-header' onClick={() => setIsExpanded(prev => !prev)} style={{ cursor: 'pointer' }}>
                <div className='item-header-title'>
                    <h2>Світлові мачти - {elements?.length || 0}</h2>
                    <h3 className='add-btn' onClick={(e) => { e.stopPropagation(); setShowForm(!showForm) }}>
                        {showForm ? '✕' : '+ додати'}
                    </h3>
                </div>
                {isExpanded && elements?.length > 0 && (
                    <div className='item-header-row'>
                        <span title='Назва'>НАЗВА</span>
                        <span title='Марка'>МАРКА</span>
                        <span title='Рік отримання'>РІК</span>
                        <span title='Потужність (Вт)'>ПОТУЖНІСТЬ (Вт)</span>
                        <span title='Місце знаходження'>МІСЦЕЗНАХОДЖЕННЯ</span>
                        <span title='Подовжувачі (к-ть)'>ПОДОВЖУВАЧІ</span>
                        <span>ДІЇ</span>
                    </div>
                )}
            </div>

            {showForm && (
                <div className='modal-overlay' onClick={() => setShowForm(false)}>
                    <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                        <div className='modal-header'>
                            <h3>Додати світлову мачту</h3>
                            <button className='close-btn' onClick={() => setShowForm(false)}>✕</button>
                        </div>
                        <form className='add-form' onSubmit={handleCreate}>
                            <label>Назва</label>
                            <input type='text' name='name' value={formData.name} onChange={handleChange} required />

                            <label>Марка</label>
                            <input type='text' name='brand' value={formData.brand} onChange={handleChange} />

                            <label>Рік отримання</label>
                            <input type='number' name='yearOfPurchase' value={formData.yearOfPurchase} onChange={handleChange} min='1900' max='2100' />

                            <label>Потужність (Вт)</label>
                            <input type='number' name='power' value={formData.power} onChange={handleChange} min='0' />

                            <label>Місце знаходження</label>
                            <input type='text' name='placeOfStorage' value={formData.placeOfStorage} onChange={handleChange} />

                            <label>Подовжувачі (к-ть)</label>
                            <input type='number' name='extensionCordsCount' value={formData.extensionCordsCount} onChange={handleChange} min='0' />

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
                        i.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        i.power?.toString().includes(searchQuery.toLowerCase())
                    ).map((item) => (
                        <div key={item.id} className='item-row-container'>
                            {editingItemId === item.id ? (
                                <form className='edit-form' onSubmit={(e) => handleUpdateSubmit(e, item.id)}>
                                    <input type='text' name='name' value={editFormData.name} onChange={handleEditChange} required placeholder='Назва' />
                                    <input type='text' name='brand' value={editFormData.brand} onChange={handleEditChange} placeholder='Марка' />
                                    <input type='number' name='yearOfPurchase' value={editFormData.yearOfPurchase} onChange={handleEditChange} placeholder='Рік' min='1900' max='2100' />
                                    <input type='number' name='power' value={editFormData.power} onChange={handleEditChange} placeholder='Потужність (Вт)' min='0' />
                                    <input type='text' name='placeOfStorage' value={editFormData.placeOfStorage} onChange={handleEditChange} placeholder='Місцезнаходження' />
                                    <input type='number' name='extensionCordsCount' value={editFormData.extensionCordsCount} onChange={handleEditChange} placeholder='Подовжувачі (к-ть)' min='0' />

                                    <div className='edit-actions'>
                                        {transferBrigades && transferBrigades.length > 0 && (
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
                                    <span title='Марка'>{item.brand || '—'}</span>
                                    <span title='Рік отримання'>{item.yearOfPurchase || '—'}</span>
                                    <span title='Потужність (Вт)'>{item.power || '—'}</span>
                                    <span title='Місце знаходження'>{item.placeOfStorage || '—'}</span>
                                    <span title='Подовжувачі (к-ть)'>{item.extensionCordsCount ?? '—'}</span>

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
                    <p style={{ padding: '1rem', color: 'var(--gray-600)' }}>Частина поки не має світлових мачт</p>
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

export default ItemLightMast
