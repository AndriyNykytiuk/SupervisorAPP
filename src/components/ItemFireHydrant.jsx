import React, { useState } from 'react'
import { MdUpdate, MdQrCode2, MdDelete, MdHistory } from 'react-icons/md'
import { toast } from 'react-toastify'
import QRCode from 'qrcode'
import { useAuth } from '../context/AuthContext.jsx'
import {
    createFireHydrant,
    updateFireHydrant,
    deleteFireHydrant,
} from '../api/services.js'
import '../scss/itemtest.scss'

const formatDate = (dateString) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('uk-UA')
}

const emptyForm = {
    inventoryNumber: '',
    location: '',
    lastInspectionDate: '',
    nextInspectionDate: '',
    status: 'working',
    pressure: '',
    diameter: '',
    inspectorName: '',
    notes: '',
}

const ItemFireHydrant = ({ items, selectedBrigade, onChanged }) => {
    const { user } = useAuth()
    const canEdit = user?.role === 'GOD' || user?.role === 'RW'

    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState(emptyForm)
    const [editingId, setEditingId] = useState(null)
    const [editData, setEditData] = useState({})
    const [qrItem, setQrItem] = useState(null)
    const [qrDataUrl, setQrDataUrl] = useState('')

    const handleCreate = async (e) => {
        e.preventDefault()
        try {
            await createFireHydrant({
                ...formData,
                lastInspectionDate: formData.lastInspectionDate || null,
                nextInspectionDate: formData.nextInspectionDate || null,
                brigadeId: selectedBrigade,
            })
            setFormData(emptyForm)
            setShowForm(false)
            toast.success('Гідрант створено')
            onChanged()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка створення')
        }
    }

    const handleEditClick = (item) => {
        setEditingId(item.id)
        setEditData({
            inventoryNumber: item.inventoryNumber || '',
            location: item.location || '',
            lastInspectionDate: item.lastInspectionDate ? item.lastInspectionDate.split('T')[0] : '',
            nextInspectionDate: item.nextInspectionDate ? item.nextInspectionDate.split('T')[0] : '',
            status: item.status || 'working',
            pressure: item.pressure || '',
            diameter: item.diameter || '',
            inspectorName: item.inspectorName || '',
            notes: item.notes || '',
        })
    }

    const handleUpdate = async (e, id) => {
        e.preventDefault()
        try {
            await updateFireHydrant(id, {
                ...editData,
                lastInspectionDate: editData.lastInspectionDate || null,
                nextInspectionDate: editData.nextInspectionDate || null,
            })
            setEditingId(null)
            setEditData({})
            toast.success('Збережено')
            onChanged()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка збереження')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Видалити гідрант?')) return
        try {
            await deleteFireHydrant(id)
            toast.success('Видалено')
            onChanged()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка видалення')
        }
    }

    const handleShowQr = async (item) => {
        const url = `${window.location.origin}/water-supply/hydrant/${item.id}`
        try {
            const dataUrl = await QRCode.toDataURL(url, { width: 600, margin: 2, errorCorrectionLevel: 'M' })
            setQrItem(item)
            setQrDataUrl(dataUrl)
        } catch {
            toast.error('Не вдалося згенерувати QR')
        }
    }

    const handlePrintQr = () => {
        if (!qrItem || !qrDataUrl) return
        const win = window.open('', '_blank', 'width=420,height=620')
        if (!win) {
            toast.error('Відкривач вікон заблокував друк')
            return
        }
        const label = qrItem.inventoryNumber ? `№ ${qrItem.inventoryNumber}` : `Гідрант №${qrItem.id}`
        const loc = qrItem.location ? `<div style="font-size:14pt;margin-top:6px;color:#334155">${qrItem.location}</div>` : ''
        win.document.write(`<!doctype html><html><head><meta charset='utf-8'><title>QR — ${label}</title>
<style>
    @page { size: 80mm 100mm; margin: 4mm; }
    body { margin: 0; font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .card { text-align: center; border: 2px solid #0f172a; border-radius: 8px; padding: 8mm; }
    .title { font-size: 11pt; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; margin-bottom: 4mm; }
    .id { font-size: 22pt; font-weight: 700; color: #0f172a; margin: 0; }
    .qr { width: 60mm; height: 60mm; margin: 4mm auto; display: block; }
    .hint { font-size: 9pt; color: #475569; margin-top: 4mm; }
</style></head><body>
<div class='card'>
    <div class='title'>Пожежний гідрант</div>
    <div class='id'>${label}</div>
    ${loc}
    <img class='qr' src='${qrDataUrl}' alt='QR'/>
    <div class='hint'>Скануйте для звіту про перевірку</div>
</div>
<script>window.onload = () => { window.focus(); window.print(); }</script>
</body></html>`)
        win.document.close()
    }

    return (
        <div className='item-wrapper'>
            <div className='item-header'>
                <div className='item-header-title'>
                    <h2>Пожежні гідранти — {items.length} шт.</h2>
                    {canEdit && (
                        <h3 className='add-btn' onClick={() => setShowForm(!showForm)}>
                            {showForm ? '✕' : '+ додати'}
                        </h3>
                    )}
                </div>
            </div>

            {showForm && (
                <div className='modal-overlay' onClick={() => setShowForm(false)}>
                    <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                        <div className='modal-header'>
                            <h3>Додати гідрант</h3>
                            <button className='close-btn' onClick={() => setShowForm(false)}>✕</button>
                        </div>
                        <form className='add-form' onSubmit={handleCreate}>
                            <input type='text' placeholder='Інв. номер' value={formData.inventoryNumber}
                                onChange={(e) => setFormData({ ...formData, inventoryNumber: e.target.value })} />
                            <input type='text' placeholder='Розташування (адреса)' value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                            <label>Дата останньої перевірки:</label>
                            <input type='date' value={formData.lastInspectionDate}
                                onChange={(e) => setFormData({ ...formData, lastInspectionDate: e.target.value })} />
                            <label>Наступна перевірка:</label>
                            <input type='date' value={formData.nextInspectionDate}
                                onChange={(e) => setFormData({ ...formData, nextInspectionDate: e.target.value })} />
                            <select value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                <option value='working'>Робочий</option>
                                <option value='broken'>Несправний</option>
                            </select>
                            <input type='text' placeholder='Тиск (атм)' value={formData.pressure}
                                onChange={(e) => setFormData({ ...formData, pressure: e.target.value })} />
                            <input type='text' placeholder='Діаметр (мм)' value={formData.diameter}
                                onChange={(e) => setFormData({ ...formData, diameter: e.target.value })} />
                            <input type='text' placeholder='Перевіряючий' value={formData.inspectorName}
                                onChange={(e) => setFormData({ ...formData, inspectorName: e.target.value })} />
                            <textarea placeholder='Нотатки' value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                            <button type='submit'>Створити</button>
                        </form>
                    </div>
                </div>
            )}

            <div className='item-body expanded'>
                {items.length > 0 && (
                    <div className='item-header-row hydrant-header-row'>
                        <span>інв. №</span>
                        <span>розташування</span>
                        <span>остання перевірка</span>
                        <span>наступна перевірка</span>
                        <span>стан</span>
                        <span>перевіряючий</span>
                        <span>QR</span>
                        <span>редагувати</span>
                    </div>
                )}
                {items.length === 0 ? (
                    <p>Гідрантів ще не додано</p>
                ) : (
                    [...items].sort((a, b) => a.id - b.id).map((item) => (
                        <div key={item.id} className='item-row-container'>
                            {editingId === item.id ? (
                                <form className='edit-form' onSubmit={(e) => handleUpdate(e, item.id)}>
                                    <input type='text' placeholder='Інв. номер' value={editData.inventoryNumber}
                                        onChange={(e) => setEditData({ ...editData, inventoryNumber: e.target.value })} />
                                    <input type='text' placeholder='Розташування' value={editData.location}
                                        onChange={(e) => setEditData({ ...editData, location: e.target.value })} />
                                    <input type='date' value={editData.lastInspectionDate}
                                        onChange={(e) => setEditData({ ...editData, lastInspectionDate: e.target.value })} />
                                    <input type='date' value={editData.nextInspectionDate}
                                        onChange={(e) => setEditData({ ...editData, nextInspectionDate: e.target.value })} />
                                    <select value={editData.status}
                                        onChange={(e) => setEditData({ ...editData, status: e.target.value })}>
                                        <option value='working'>Робочий</option>
                                        <option value='broken'>Несправний</option>
                                    </select>
                                    <input type='text' placeholder='Тиск' value={editData.pressure}
                                        onChange={(e) => setEditData({ ...editData, pressure: e.target.value })} />
                                    <input type='text' placeholder='Діаметр' value={editData.diameter}
                                        onChange={(e) => setEditData({ ...editData, diameter: e.target.value })} />
                                    <input type='text' placeholder='Перевіряючий' value={editData.inspectorName}
                                        onChange={(e) => setEditData({ ...editData, inspectorName: e.target.value })} />
                                    <textarea placeholder='Нотатки' value={editData.notes}
                                        onChange={(e) => setEditData({ ...editData, notes: e.target.value })} />
                                    <div className='edit-actions'>
                                        <button type='submit' className='save-btn'>Зберегти</button>
                                        <a href={`/water-supply/hydrant/${item.id}`}
                                            className='history-btn'
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#0f172a', color: '#fff', padding: '0.5rem 1rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 500 }}>
                                            <MdHistory /> Історія перевірок
                                        </a>
                                        <button type='button' className='archive-btn'
                                            onClick={() => handleDelete(item.id)}
                                            style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                                            Видалити
                                        </button>
                                        <button type='button' className='cancel-btn' onClick={() => setEditingId(null)}>Відмінити</button>
                                    </div>
                                </form>
                            ) : (
                                <div className={`hydrant-card-wrapper ${item.status === 'working' ? 'is-pass' : 'is-fail'}`}>
                                    <div className={`item-row ${item.status === 'working' ? 'item-pass' : 'item-fail'}`}>
                                        <span style={{ flex: '0.5' }} title='Інв. №'>{item.inventoryNumber || '—'}</span>
                                        <span style={{ flex: '1.5' }} title='Розташування'>{item.location || '—'}</span>
                                        <span style={{ flex: '1' }} title='Остання перевірка'>{formatDate(item.lastInspectionDate)}</span>
                                        <span style={{ flex: '1' }} title='Наступна перевірка'>{formatDate(item.nextInspectionDate)}</span>
                                        <span style={{ flex: '0.5' }} title='Стан'>{item.status === 'working' ? 'Робочий' : 'Несправний'}</span>
                                        <span style={{ flex: '0.5' }} title='Перевіряючий'>{item.inspectorName || '—'}</span>
                                        <button className='update-btn' title='QR-код' onClick={() => handleShowQr(item)}>
                                            <MdQrCode2 />
                                        </button>
                                        {canEdit && (
                                            <button className='update-btn' title='Редагувати' onClick={() => handleEditClick(item)}>
                                                <MdUpdate />
                                            </button>
                                        )}
                                    </div>
                                    <div className='hydrant-row-checks'>
                                        <span className={item.waterClean ? 'chk on' : 'chk off'}>{item.waterClean ? '✓' : '✗'} вода чиста</span>
                                        <span className={item.noWaterHammer ? 'chk on' : 'chk off'}>{item.noWaterHammer ? '✓' : '✗'} гідроудари відсутні</span>
                                        <span className={item.indicatorsPresent ? 'chk on' : 'chk off'}>{item.indicatorsPresent ? '✓' : '✗'} покажчики</span>
                                        <span className={item.conesPresent ? 'chk on' : 'chk off'}>{item.conesPresent ? '✓' : '✗'} конуси</span>
                                        <span className={item.groundingOk ? 'chk on' : 'chk off'}>{item.groundingOk ? '✓' : '✗'} заземлення</span>
                                        {item.pressure && <span className='chk neutral'>тиск: {item.pressure}</span>}
                                    </div>
                                    {item.notes && (
                                        <div className='hydrant-row-notes'>
                                            <strong>Додаткові нотатки:</strong> {item.notes}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {qrItem && (
                <div className='modal-overlay' onClick={() => setQrItem(null)}>
                    <div className='modal-content' onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center' }}>
                        <div className='modal-header'>
                            <h3>QR — {qrItem.inventoryNumber || `№${qrItem.id}`}</h3>
                            <button className='close-btn' onClick={() => setQrItem(null)}>✕</button>
                        </div>
                        <img src={qrDataUrl} alt='QR' style={{ width: '100%', maxWidth: '320px' }} />
                        <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', wordBreak: 'break-all' }}>
                            {`${window.location.origin}/water-supply/hydrant/${qrItem.id}`}
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                            <a href={qrDataUrl} download={`hydrant-${qrItem.inventoryNumber || qrItem.id}.png`}
                                style={{ padding: '0.5rem 1rem', background: '#475569', color: '#fff', borderRadius: '6px', textDecoration: 'none' }}>
                                Завантажити PNG
                            </a>
                            <button type='button' onClick={handlePrintQr}
                                style={{ padding: '0.5rem 1rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
                                Друк наліпки
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ItemFireHydrant
