import React, { useState, useEffect } from 'react'
import { MdUpdate } from 'react-icons/md'
import { toast } from 'react-toastify'
import {
    fetchFireExtenguishersByBrigade,
    createFireExtenguisher,
    updateFireExtenguisher,
    archiveEquipmentItem,
} from '../api/services.js'
import ArchiveModal from './ArchiveModal.jsx'
import '../scss/itemtest.scss'

const EXTINGUISHER_TYPES = ['ВП-2(з)', 'ВП-5(з)','ВВК-1.4']

const initialFormState = {
    inventoryNumber: '',
    extinguisherType: 'ВП-2(з)',
    location: '',
    nextMaintenanceDate: '',
    inspectionConclusion: '',
    maintenanceOrganization: '',
}

const formatDate = (dateString) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('uk-UA')
}

const FireExtenguisher = ({ selectedBrigade, searchQuery = '' }) => {
    const [items, setItems] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const [formData, setFormData] = useState(initialFormState)
    const [editingItemId, setEditingItemId] = useState(null)
    const [editFormData, setEditFormData] = useState({})
    const [itemToArchive, setItemToArchive] = useState(null)

    const fetchData = async () => {
        if (!selectedBrigade) return
        try {
            const data = await fetchFireExtenguishersByBrigade(selectedBrigade)
            setItems(data || [])
        } catch (err) {
            console.error('Failed to fetch fire extenguishers:', err)
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

    const buildPayload = (data) => ({
        inventoryNumber: data.inventoryNumber || null,
        extinguisherType: data.extinguisherType,
        location: data.location || null,
        nextMaintenanceDate: data.nextMaintenanceDate || null,
        inspectionConclusion: data.inspectionConclusion || null,
        maintenanceOrganization: data.maintenanceOrganization || null,
    })

    const handleCreate = async (e) => {
        e.preventDefault()
        try {
            await createFireExtenguisher({
                ...buildPayload(formData),
                brigadeId: selectedBrigade,
            })
            setFormData(initialFormState)
            setShowForm(false)
            toast.success('Вогнегасник додано!')
            fetchData()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка при збереженні')
            console.error('Failed to create fire extenguisher:', err)
        }
    }

    const handleEditClick = (item) => {
        setEditingItemId(item.id)
        setEditFormData({
            inventoryNumber: item.inventoryNumber || '',
            extinguisherType: item.extinguisherType || 'ВП-2(з)',
            location: item.location || '',
            nextMaintenanceDate: item.nextMaintenanceDate ? item.nextMaintenanceDate.split('T')[0] : '',
            inspectionConclusion: item.inspectionConclusion || '',
            maintenanceOrganization: item.maintenanceOrganization || '',
        })
    }

    const handleCancelEdit = () => {
        setEditingItemId(null)
        setEditFormData({})
    }

    const handleUpdateSubmit = async (e, id) => {
        e.preventDefault()
        try {
            await updateFireExtenguisher(id, buildPayload(editFormData))
            toast.success('Дані оновлено!')
            setEditingItemId(null)
            fetchData()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка при оновленні')
            console.error('Failed to update fire extenguisher:', err)
        }
    }

    const handleOpenArchive = (item) => {
        setItemToArchive(item)
    }

    const handleConfirmArchive = async (archiveData) => {
        if (!itemToArchive) return
        try {
            await archiveEquipmentItem({
                equipmentType: 'FireExtenguisher',
                originalId: itemToArchive.id,
                ...archiveData,
            })
            fetchData()
            if (editingItemId === itemToArchive.id) handleCancelEdit()
        } catch (error) {
            console.error('Failed to archive FireExtenguisher:', error)
            throw error
        }
    }

    if (!selectedBrigade) return null

    const matchesSearch = (i) => !searchQuery ||
        'вогнегасники'.includes(searchQuery.toLowerCase()) ||
        i.inventoryNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.extinguisherType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.location?.toLowerCase().includes(searchQuery.toLowerCase())

    const filtered = items.filter(matchesSearch).sort((a, b) => a.id - b.id)

    return (
        <div className='item-wrapper'>
            <div className='item-header' onClick={() => setIsExpanded(!isExpanded)} style={{ cursor: 'pointer' }}>
                <div className='item-header-title'>
                    <div className='item-header-title-add' style={{ flex: 1, userSelect: 'none' }}>
                        <h2>Вогнегасники - {items.length} шт.</h2>
                    </div>
                    <div className='item-header-actions'>
                        {isExpanded && (
                            <h3 className='add-btn' onClick={(e) => { e.stopPropagation(); setShowForm(!showForm) }}>
                                {showForm ? '✕' : '+ додати'}
                            </h3>
                        )}
                    </div>
                </div>
                {isExpanded && items.length > 0 && (
                    <div className='item-header-row'>
                        <span>інвентарний номер</span>
                        <span>тип</span>
                        <span>місце розташування</span>
                        <span>наступне ТО</span>
                        <span>висновки</span>
                        <span>організація ТО</span>
                        <span>оновити</span>
                    </div>
                )}
            </div>

            {showForm && (
                <div className='modal-overlay' onClick={() => setShowForm(false)} style={{ zIndex: 9999 }}>
                    <div className='modal-content' onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className='modal-header'>
                            <h3>Додати вогнегасник</h3>
                            <button className='close-btn' onClick={() => setShowForm(false)}>✕</button>
                        </div>
                        <form className='add-form' onSubmit={handleCreate} style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem' }}>
                            <input type='text' name='inventoryNumber' placeholder='Інвентарний номер' value={formData.inventoryNumber} onChange={handleChange} />

                            <label>Тип вогнегасника:</label>
                            <select name='extinguisherType' value={formData.extinguisherType} onChange={handleChange} required>
                                {EXTINGUISHER_TYPES.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>

                            <input type='text' name='location' placeholder='Місце розташування' value={formData.location} onChange={handleChange} />

                            <label>Наступне ТО:</label>
                            <input type='date' name='nextMaintenanceDate' value={formData.nextMaintenanceDate} onChange={handleChange} />

                            <input type='text' name='inspectionConclusion' placeholder='Висновки' value={formData.inspectionConclusion} onChange={handleChange} />

                            <input type='text' name='maintenanceOrganization' placeholder='Організація ТО' value={formData.maintenanceOrganization} onChange={handleChange} />

                            <button type='submit'>Створити</button>
                        </form>
                    </div>
                </div>
            )}

            <div className={`item-body ${isExpanded ? 'expanded' : ''}`}>
                {filtered.length > 0 ? (
                    filtered.map((item) => (
                        <div key={item.id} className='item-row-container'>
                            {editingItemId === item.id ? (
                                <form className='edit-form' onSubmit={(e) => handleUpdateSubmit(e, item.id)}>
                                    <input type='text' name='inventoryNumber' placeholder='Інв. номер' value={editFormData.inventoryNumber} onChange={handleEditChange} />
                                    <select name='extinguisherType' value={editFormData.extinguisherType} onChange={handleEditChange} required>
                                        {EXTINGUISHER_TYPES.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                    <input type='text' name='location' placeholder='Місце' value={editFormData.location} onChange={handleEditChange} />
                                    <input type='date' name='nextMaintenanceDate' value={editFormData.nextMaintenanceDate} onChange={handleEditChange} />
                                    <input type='text' name='inspectionConclusion' placeholder='Висновки' value={editFormData.inspectionConclusion} onChange={handleEditChange} />
                                    <input type='text' name='maintenanceOrganization' placeholder='Організація ТО' value={editFormData.maintenanceOrganization} onChange={handleEditChange} />

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
                                    <span style={{ flex: '0.8' }} title='Інвентарний номер'>{item.inventoryNumber || '—'}</span>
                                    <span style={{ flex: '0.7' }} title='Тип'>{item.extinguisherType}</span>
                                    <span style={{ flex: '1.2' }} title='Місце розташування'>{item.location || '—'}</span>
                                    <span style={{ flex: '1' }} title='Наступне ТО'>{formatDate(item.nextMaintenanceDate)}</span>
                                    <span style={{ flex: '1.2' }} title='Висновки'>{item.inspectionConclusion || '—'}</span>
                                    <span style={{ flex: '1' }} title='Організація ТО'>{item.maintenanceOrganization || '—'}</span>
                                    <button className='update-btn' onClick={() => handleEditClick(item)}>
                                        <MdUpdate />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p>Вогнегасників ще немає</p>
                )}
            </div>

            <ArchiveModal
                isOpen={!!itemToArchive}
                itemName={itemToArchive ? `Вогнегасник ${itemToArchive.extinguisherType}${itemToArchive.inventoryNumber ? ` (${itemToArchive.inventoryNumber})` : ''}` : ''}
                onClose={() => setItemToArchive(null)}
                onConfirm={handleConfirmArchive}
            />
        </div>
    )
}

export default FireExtenguisher
