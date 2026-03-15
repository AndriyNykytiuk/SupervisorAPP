import React, { useState, useEffect } from 'react'
import { MdUpdate, MdDelete } from "react-icons/md"
import '../scss/itemelectrictool.scss'

const ItemElectricTool = ({ selectedBrigade }) => {
    const [elements, setElements] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [editingItemId, setEditingItemId] = useState(null)

    const initialFormState = {
        name: '',
        yaerOfPurchase: '', // typo left intentionally to match model spec from user
        powerOf: '',
        placeOfStorage: '',
        notes: ''
    }

    const [formData, setFormData] = useState(initialFormState)
    const [editFormData, setEditFormData] = useState({})

    const fetchData = async () => {
        if (!selectedBrigade) return
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/electric-stations/brigade/${selectedBrigade}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setElements(data)
            }
        } catch (err) {
            console.error('Failed to fetch Electric Stations:', err)
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
            const token = localStorage.getItem('token')
            const res = await fetch('/api/electric-stations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: formData.name,
                    yaerOfPurchase: formData.yaerOfPurchase ? parseInt(formData.yaerOfPurchase, 10) : null,
                    powerOf: formData.powerOf ? parseInt(formData.powerOf, 10) : null,
                    placeOfStorage: formData.placeOfStorage,
                    notes: formData.notes,
                    brigadeId: selectedBrigade,
                }),
            })

            if (res.ok) {
                setFormData(initialFormState)
                setShowForm(false)
                fetchData()
            }
        } catch (err) {
            console.error('Failed to create Electric Station:', err)
        }
    }

    const handleUpdateSubmit = async (e, id) => {
        e.preventDefault()
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/electric-stations/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: editFormData.name,
                    yaerOfPurchase: editFormData.yaerOfPurchase ? parseInt(editFormData.yaerOfPurchase, 10) : null,
                    powerOf: editFormData.powerOf ? parseInt(editFormData.powerOf, 10) : null,
                    placeOfStorage: editFormData.placeOfStorage,
                    notes: editFormData.notes,
                }),
            })

            if (res.ok) {
                setEditingItemId(null)
                fetchData()
            }
        } catch (err) {
            console.error('Failed to update Electric Station:', err)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Дійсно видалити цей генератор/станцію?")) return;
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/electric-stations/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                fetchData()
            }
        } catch (err) {
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
            notes: item.notes || ''
        })
    }

    const handleCancelEdit = () => {
        setEditingItemId(null)
        setEditFormData({})
    }

    if (!selectedBrigade) return null;

    return (
        <div className='item-electrictool-wrapper'>
            <div className='item-header'>
                <div className='item-header-title'>
                    <h2>Електростанції - {elements?.length}</h2>
                    <h3 className='add-btn' onClick={() => setShowForm(!showForm)}>
                        {showForm ? '✕' : '+ додати'}
                    </h3>
                </div>
                {elements?.length > 0 && (
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

            <div className='item-body'>
                {elements?.length > 0 ? (
                    elements.map((item) => (
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
                                        <button type='submit' className='save-btn'>Зберегти</button>
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
                )}
            </div>
        </div>
    )
}

export default ItemElectricTool
