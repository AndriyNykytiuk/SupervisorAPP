import React, { useState, useEffect, useRef } from 'react'
import { MdUpdate, MdDelete } from "react-icons/md"
import { fetchElectricStationsByBrigade, createElectricStation, updateElectricStation, deleteElectricStation, archiveEquipmentItem, transferItems } from '../api/services.js';
import { toast } from 'react-toastify';
import ArchiveModal from './ArchiveModal.jsx'
import '../scss/itemelectrictool.scss'

const ItemElectricTool = ({ selectedBrigade, searchQuery = '', transferBrigades = [] }) => {
    const [elements, setElements] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [editingItemId, setEditingItemId] = useState(null)
    const [isExpanded, setIsExpanded] = useState(false)
    const toggleExpand = () => setIsExpanded(prev => !prev)
    const wrapperRef = useRef(null)

    const initialFormState = {
        name: '',
        yaerOfPurchase: '', // typo left intentionally to match model spec from user
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
            const data = await fetchElectricStationsByBrigade(selectedBrigade);
            setElements(data)
        } catch (err) {
            console.error('Failed to fetch Electric Stations:', err)
        }
    }

    useEffect(() => {
        fetchData()
    }, [selectedBrigade])

    useEffect(() => {
        if (searchQuery) {
            setIsExpanded(true);
            const hasMatch = elements?.some(i => 
                i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                i.powerOf?.toString().includes(searchQuery.toLowerCase())
            );
            if (hasMatch) {
                setTimeout(() => {
                    wrapperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
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
        if (!formData.name.trim()) return

        try {
            await createElectricStation({
                name: formData.name,
                yaerOfPurchase: formData.yaerOfPurchase ? parseInt(formData.yaerOfPurchase, 10) : null,
                powerOf: formData.powerOf ? parseInt(formData.powerOf, 10) : null,
                placeOfStorage: formData.placeOfStorage,
                notes: formData.notes,
                brigadeId: selectedBrigade,
            });

            setFormData(initialFormState)
            setShowForm(false)
            toast.success('Генератор/станцію успішно додано!');
            fetchData()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка при збереженні')
            console.error('Failed to create Electric Station:', err)
        }
    }

    const handleUpdateSubmit = async (e, id) => {
        e.preventDefault()
        try {
            await updateElectricStation(id, {
                name: editFormData.name,
                yaerOfPurchase: editFormData.yaerOfPurchase ? parseInt(editFormData.yaerOfPurchase, 10) : null,
                powerOf: editFormData.powerOf ? parseInt(editFormData.powerOf, 10) : null,
                placeOfStorage: editFormData.placeOfStorage,
                notes: editFormData.notes,
            });
            if (editFormData.transferToBrigadeId) {
                await transferItems({
                    electricStationIds: [id],
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
            console.error('Failed to update Electric Station:', err)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Дійсно видалити цей генератор/станцію?")) return;
        try {
            await deleteElectricStation(id);
            toast.success('Запис успішно видалено!');
            fetchData()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка при видаленні')
            console.error('Failed to delete Electric Station:', err)
        }
    }

    const handleEditClick = (item) => {
        setEditingItemId(item.id)
        setEditFormData({
            name: item.name || '',
            yaerOfPurchase: item.yaerOfPurchase || '',
            powerOf: item.powerOf || '',
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
                equipmentType: 'ElectricStations',
                originalId: itemToArchive.id,
                ...archiveData
            })
            fetchData()
            if (editingItemId === itemToArchive.id) {
                handleCancelEdit()
            }
        } catch (error) {
            console.error('Failed to archive Electric Station:', error)
            throw error
        }
    }

    if (!selectedBrigade) return null;

    // Hide component if search query doesn't match list name or any item name
    const listNameMatch = !searchQuery || 'Електростанції'.toLowerCase().includes(searchQuery.toLowerCase());
    const hasMatchingItems = elements?.some(i => 
        i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.powerOf?.toString().includes(searchQuery.toLowerCase())
    );
    if (searchQuery && !listNameMatch && !hasMatchingItems) return null;

    return (
        <div className='item-electrictool-wrapper' ref={wrapperRef}>
            <div className='item-header' onClick={() => setIsExpanded(!isExpanded)} style={{ cursor: 'pointer' }}>
                <div className='item-header-title'>
                    <h2>Електростанції - {elements?.length}</h2>
                    <h3 className='add-btn' onClick={(e) => { e.stopPropagation(); setShowForm(!showForm); }}>
                        {showForm ? '✕' : '+ додати'}
                    </h3>
                </div>
                {isExpanded && elements?.length > 0 && (
                    <div className='item-header-row electric-station-row'>
                        <span>назва обладнання</span>
                        <span>рік закупівлі</span>
                        <span>потужність (кВт)</span>
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
                            <h3>Додати електростанцію/генератор</h3>
                            <button className="close-btn" onClick={() => setShowForm(false)}>✕</button>
                        </div>
                        <form className='add-form' onSubmit={handleCreate}>
                            <input type='text' name='name' placeholder='Назва обладнання' value={formData.name} onChange={handleChange} required />
                            <input type='number' name='yaerOfPurchase' placeholder='Рік закупівлі' value={formData.yaerOfPurchase} onChange={handleChange} required />
                            <input type='number' name='powerOf' placeholder='Потужність (кВт)' value={formData.powerOf} onChange={handleChange} required />
                            <select name='placeOfStorage' value={formData.placeOfStorage} onChange={handleChange} required>
                                <option value="" disabled>Оберіть місце зберігання</option>
                                <option value="На автомобілях">На автомобілях</option>
                                <option value="Готові до залучення">Готові до залучення</option>
                                <option value="Залучені">Залучені</option>
                                <option value="Резервне живлення підрозділів">Резервне живлення підрозділів</option>
                                <option value="Склад АРЗ СП">Склад АРЗ СП</option>
                                <option value="На автомобілях зведеного загону">На автомобілях зведеного загону</option>
                                <option value="Склад зведеного загону">Склад зведеного загону</option>
                                <option value="Ремонт">Ремонт</option>
                            </select>
                            <input type='text' name='notes' placeholder='Примітки' value={formData.notes} onChange={handleChange} />

                            <button type='submit'>Створити</button>
                        </form>
                    </div>
                </div>
            )}

            <div className={`item-body `}>
                {isExpanded && (elements?.length > 0 ? (
                    elements.filter(i => 
                        listNameMatch || 
                        i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        i.powerOf?.toString().includes(searchQuery.toLowerCase())
                    ).map((item) => (
                        <div key={item.id} className='item-row-container'>
                            {editingItemId === item.id ? (
                                <form className='edit-form' onSubmit={(e) => handleUpdateSubmit(e, item.id)}>
                                    <input type='text' name='name' placeholder='Назва' value={editFormData.name} onChange={handleEditChange} required />
                                    <input type='number' name='yaerOfPurchase' placeholder='Рік' value={editFormData.yaerOfPurchase} onChange={handleEditChange} required />
                                    <input type='number' name='powerOf' placeholder='Потужність' value={editFormData.powerOf} onChange={handleEditChange} required />
                                    <select name='placeOfStorage' value={editFormData.placeOfStorage} onChange={handleEditChange} required>
                                        <option value="" disabled>Оберіть місце зберігання</option>
                                        <option value="На автомобілях">На автомобілях</option>
                                        <option value="Готові до залучення">Готові до залучення</option>
                                        <option value="Залучені">Залучені</option>
                                        <option value="Резервне живлення підрозділів">Резервне живлення підрозділів</option>
                                        <option value="Склад АРЗ СП">Склад АРЗ СП</option>
                                        <option value="На автомобілях зведеного загону">На автомобілях зведеного загону</option>
                                        <option value="Склад зведеного загону">Склад зведеного загону</option>
                                        <option value="Ремонт">Ремонт</option>
                                    </select>
                                    <input type='text' name='notes' placeholder='Примітки' value={editFormData.notes} onChange={handleEditChange} />

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
                                <div className='item-row electric-station-row'>
                                    <span style={{ flex: '1.5' }} title="Назва">{item.name}</span>
                                    <span style={{ flex: '0.5' }} title="Рік закупівлі">{item.yaerOfPurchase || '—'}</span>
                                    <span style={{ flex: '0.8' }} title="Потужність (кВт)">{item.powerOf || '—'}</span>
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
                    <p style={{ padding: '1rem', color: 'var(--gray-600)' }}>Частина поки не має таких генераторів</p>
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

export default ItemElectricTool
