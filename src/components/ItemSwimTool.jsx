import React, { useState, useEffect } from 'react'
import { MdUpdate, MdDelete } from "react-icons/md"
import '../scss/itemswimtool.scss'

const ItemSwimTool = ({ selectedBrigade }) => {
    const [elements, setElements] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [editingItemId, setEditingItemId] = useState(null)

    const initialFormState = {
        lifeBoat: '',
        motorLifeBoat: '',
        lifeBouy: '',
        lifeRoup: '',
        lifePath: '',
        rescueSlad: '',
        lifeJacket: '',
        drySuits: ''
    }

    const [formData, setFormData] = useState(initialFormState)
    const [editFormData, setEditFormData] = useState({})

    const fetchData = async () => {
        if (!selectedBrigade) return
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/swim-tools/brigade/${selectedBrigade}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setElements(data)
            }
        } catch (err) {
            console.error('Failed to fetch Swim Tools:', err)
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

        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/swim-tools', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    lifeBoat: formData.lifeBoat ? parseInt(formData.lifeBoat, 10) : 0,
                    motorLifeBoat: formData.motorLifeBoat ? parseInt(formData.motorLifeBoat, 10) : 0,
                    lifeBouy: formData.lifeBouy ? parseInt(formData.lifeBouy, 10) : 0,
                    lifeRoup: formData.lifeRoup ? parseInt(formData.lifeRoup, 10) : 0,
                    lifePath: formData.lifePath ? parseInt(formData.lifePath, 10) : 0,
                    rescueSlad: formData.rescueSlad ? parseInt(formData.rescueSlad, 10) : 0,
                    lifeJacket: formData.lifeJacket ? parseInt(formData.lifeJacket, 10) : 0,
                    drySuits: formData.drySuits ? parseInt(formData.drySuits, 10) : 0,
                    brigadeId: selectedBrigade,
                }),
            })

            if (res.ok) {
                setFormData(initialFormState)
                setShowForm(false)
                fetchData()
            }
        } catch (err) {
            console.error('Failed to create Swim Tool:', err)
        }
    }

    const handleUpdateSubmit = async (e, id) => {
        e.preventDefault()
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/swim-tools/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    lifeBoat: editFormData.lifeBoat ? parseInt(editFormData.lifeBoat, 10) : 0,
                    motorLifeBoat: editFormData.motorLifeBoat ? parseInt(editFormData.motorLifeBoat, 10) : 0,
                    lifeBouy: editFormData.lifeBouy ? parseInt(editFormData.lifeBouy, 10) : 0,
                    lifeRoup: editFormData.lifeRoup ? parseInt(editFormData.lifeRoup, 10) : 0,
                    lifePath: editFormData.lifePath ? parseInt(editFormData.lifePath, 10) : 0,
                    rescueSlad: editFormData.rescueSlad ? parseInt(editFormData.rescueSlad, 10) : 0,
                    lifeJacket: editFormData.lifeJacket ? parseInt(editFormData.lifeJacket, 10) : 0,
                    drySuits: editFormData.drySuits ? parseInt(editFormData.drySuits, 10) : 0,
                }),
            })

            if (res.ok) {
                setEditingItemId(null)
                fetchData()
            }
        } catch (err) {
            console.error('Failed to update Swim Tool:', err)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Дійсно видалити цей запис?")) return;
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/swim-tools/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                fetchData()
            }
        } catch (err) {
            console.error('Failed to delete Swim Tool:', err)
        }
    }

    const handleEditClick = (item) => {
        setEditingItemId(item.id)
        setEditFormData({
            lifeBoat: item.lifeBoat ?? 0,
            motorLifeBoat: item.motorLifeBoat ?? 0,
            lifeBouy: item.lifeBouy ?? 0,
            lifeRoup: item.lifeRoup ?? 0,
            lifePath: item.lifePath ?? 0,
            rescueSlad: item.rescueSlad ?? 0,
            lifeJacket: item.lifeJacket ?? 0,
            drySuits: item.drySuits ?? 0
        })
    }

    const handleCancelEdit = () => {
        setEditingItemId(null)
        setEditFormData({})
    }

    if (!selectedBrigade) return null;

    return (
        <div className='item-swimtool-wrapper'>
            <div className='item-header'>
                <div className='item-header-title'>
                    <h2>Засоби порятунку на воді</h2>
                    <h3 className='add-btn' onClick={() => setShowForm(!showForm)}>
                        {showForm ? '✕' : '+ додати'}
                    </h3>
                </div>
                {elements?.length > 0 && (
                    <div className='item-header-row swim-tool-row'>
                        <span title="Рятувальні човни">РЯТУВАЛЬНИЙ ЧОВЕН</span>
                        <span title="Моторні рятувальні човни">МОТОРНИЙ ЧОВЕН</span>
                        <span title="Рятувальні круги">РЯТУВАЛЬНІ КРУГИ</span>
                        <span title="Рятувальні мотузки">РЯТУВАЛЬНА МОТУЗКА, 100м</span>
                        <span title="Кінець Александрова">РЯТУВАЛЬНА СОЛОМИНКА</span>
                        <span title="Рятувальні сани">РЯТУВАЛЬНІ САНИ</span>
                        <span title="Рятувальні жилети">РЯТУВАЛЬНІ ЖИЛЕТИ</span>
                        <span title="Сухі гідрокостюми">ГІДРОКОСТЮМИ</span>
                        <span>Оновити дані</span>
                    </div>
                )}
            </div>

            {showForm && (
                <div className='modal-overlay' onClick={() => setShowForm(false)}>
                    <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Додати запис інвентарю</h3>
                            <button className="close-btn" onClick={() => setShowForm(false)}>✕</button>
                        </div>
                        <form className='add-form' onSubmit={handleCreate}>
                            <label>Рятувальні човни</label>
                            <input type='number' name='lifeBoat' value={formData.lifeBoat} onChange={handleChange} min="0" />
                            <label>Моторні рятувальні човни</label>
                            <input type='number' name='motorLifeBoat' value={formData.motorLifeBoat} onChange={handleChange} min="0" />
                            <label>Рятувальні круги</label>
                            <input type='number' name='lifeBouy' value={formData.lifeBouy} onChange={handleChange} min="0" />
                            <label>Рятувальні мотузки</label>
                            <input type='number' name='lifeRoup' value={formData.lifeRoup} onChange={handleChange} min="0" />
                            <label>Кінець Александрова</label>
                            <input type='number' name='lifePath' value={formData.lifePath} onChange={handleChange} min="0" />
                            <label>Рятувальні сани</label>
                            <input type='number' name='rescueSlad' value={formData.rescueSlad} onChange={handleChange} min="0" />
                            <label>Рятувальні жилети</label>
                            <input type='number' name='lifeJacket' value={formData.lifeJacket} onChange={handleChange} min="0" />
                            <label>Сухі гідрокостюми</label>
                            <input type='number' name='drySuits' value={formData.drySuits} onChange={handleChange} min="0" />

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
                                    <input type='number' name='lifeBoat' value={editFormData.lifeBoat} onChange={handleEditChange} min="0" />
                                    <input type='number' name='motorLifeBoat' value={editFormData.motorLifeBoat} onChange={handleEditChange} min="0" />
                                    <input type='number' name='lifeBouy' value={editFormData.lifeBouy} onChange={handleEditChange} min="0" />
                                    <input type='number' name='lifeRoup' value={editFormData.lifeRoup} onChange={handleEditChange} min="0" />
                                    <input type='number' name='lifePath' value={editFormData.lifePath} onChange={handleEditChange} min="0" />
                                    <input type='number' name='rescueSlad' value={editFormData.rescueSlad} onChange={handleEditChange} min="0" />
                                    <input type='number' name='lifeJacket' value={editFormData.lifeJacket} onChange={handleEditChange} min="0" />
                                    <input type='number' name='drySuits' value={editFormData.drySuits} onChange={handleEditChange} min="0" />

                                    <div className='edit-actions'>
                                        <button type='submit' className='save-btn'>Зберегти</button>
                                        <button type='button' className='cancel-btn' onClick={handleCancelEdit}>відмінити</button>
                                    </div>
                                </form>
                            ) : (
                                <div className='item-row swim-tool-row'>
                                    <span title="Рятувальні човни">{item.lifeBoat ?? 0}</span>
                                    <span title="Моторні рятувальні човни">{item.motorLifeBoat ?? 0}</span>
                                    <span title="Рятувальні круги">{item.lifeBouy ?? 0}</span>
                                    <span title="Рятувальні мотузки">{item.lifeRoup ?? 0}</span>
                                    <span title="Кінець Александрова">{item.lifePath ?? 0}</span>
                                    <span title="Рятувальні сани">{item.rescueSlad ?? 0}</span>
                                    <span title="Рятувальні жилети">{item.lifeJacket ?? 0}</span>
                                    <span title="Сухі гідрокостюми">{item.drySuits ?? 0}</span>

                                    <span className="action-buttons-wrap" title="оновити дані">
                                        <button className='update-btn' onClick={() => handleEditClick(item)} title="Редагувати">
                                            <MdUpdate size={20} />
                                        </button>
                                    </span>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p style={{ padding: '1rem', color: 'var(--gray-600)' }}>Частина поки не має записів про засоби порятунку на воді</p>
                )}
            </div>
        </div>
    )
}

export default ItemSwimTool
