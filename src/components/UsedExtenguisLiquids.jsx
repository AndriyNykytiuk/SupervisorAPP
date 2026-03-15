import React from 'react'
import { IoMdAddCircleOutline } from "react-icons/io";
import { MdClose } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import '../scss/usedextenguisliquids.scss';

const UsedExtenguishLiquids = ({ selectedBrigade }) => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const [notification, setNotification] = React.useState({ open: false, message: '', type: 'success' });

    const showNotification = (message, type = 'success') => setNotification({ open: true, message, type });
    const closeNotification = () => setNotification({ open: false, message: '', type: 'success' });

    const [usageRecords, setUsageRecords] = React.useState([]);

    const [newRecord, setNewRecord] = React.useState({
        volume: '',
        date: '',
        type: '',
        liquid: '',
        address: ''
    });

    // Завантаження даних з бекенду
    const fetchRecords = async () => {
        if (!selectedBrigade) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/usage-liquids-log/brigade/${selectedBrigade}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const items = await res.json();
                setUsageRecords(items);
            }
        } catch (err) {
            console.error('Failed to fetch usage records:', err);
        }
    };

    React.useEffect(() => { fetchRecords(); }, [selectedBrigade]);

    const handleInputChange = (field, value) => {
        setNewRecord(prev => ({ ...prev, [field]: value }));
    };

    const handleOpenModal = () => {
        setNewRecord({ volume: '', date: '', type: '', liquid: '', address: '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setNewRecord({ volume: '', date: '', type: '', liquid: '', address: '' });
    };

    // POST — створення нового запису
    const handleSaveRecord = async () => {
        if (!newRecord.volume || !newRecord.date || !newRecord.type.trim() || !newRecord.liquid.trim() || !newRecord.address.trim()) {
            showNotification('Будь ласка, заповніть всі поля', 'error');
            return;
        }

        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/usage-liquids-log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    volume: parseInt(newRecord.volume),
                    date: newRecord.date,
                    substance: newRecord.liquid,
                    eventType: newRecord.type,
                    address: newRecord.address,
                    brigadeId: selectedBrigade,
                }),
            });

            if (res.ok) {
                await fetchRecords();
                handleCloseModal();
                showNotification('Запис успішно додано!', 'success');
            } else {
                showNotification('Помилка при додаванні запису', 'error');
            }
        } catch (error) {
            console.error('Помилка при додаванні запису:', error);
            showNotification('Помилка при додаванні запису', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // DELETE — видалення запису
    const handleDeleteRecord = async (id) => {
        if (!confirm('Ви впевнені, що хочете видалити цей запис?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/usage-liquids-log/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                await fetchRecords();
            } else {
                showNotification('Помилка при видаленні запису', 'error');
            }
        } catch (error) {
            console.error('Помилка при видаленні:', error);
            showNotification('Помилка при видаленні запису', 'error');
        }
    };

    return (
        <>
            <div className="foam-wrapper used-liquids-wrapper">
                <div className="foam-header" style={{ padding: '0 0 0.5rem 0', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: 0 }}>
                        Використання з початку року на пожежах, навчаннях, тренуваннях тощо
                    </h3>
                    <button onClick={handleOpenModal} className="add-record-btn">
                        <IoMdAddCircleOutline style={{ fontSize: '1.25rem' }} />
                        Додати запис
                    </button>
                </div>

                <Totals usageRecords={usageRecords} />

                <div className="records-list">
                    {usageRecords.length === 0 ? (
                        <div className="empty-records">
                            Немає записів про використання
                        </div>
                    ) : (
                        usageRecords.map((record) => (
                            <div key={record.id} className="record-card">
                                <div className="record-field">
                                    <span className="field-label">Об'єм:</span>
                                    <span className="field-value highlight">{record.volume}л</span>
                                </div>
                                <div className="record-divider"></div>
                                <div className="record-field">
                                    <span className="field-label">Дата:</span>
                                    <span className="field-value">{record.date}</span>
                                </div>
                                <div className="record-divider"></div>
                                <div className="record-field">
                                    <span className="field-label">Речовина:</span>
                                    <span className="field-value">{record.substance}</span>
                                </div>
                                <div className="record-divider"></div>
                                <div className="record-field">
                                    <span className="field-label">Тип:</span>
                                    <span className="field-value">{record.eventType}</span>
                                </div>
                                <div className="record-divider"></div>
                                <div className="record-field">
                                    <span className="field-label">Адреса:</span>
                                    <span className="field-value">{record.address}</span>
                                </div>

                                <AiOutlineDelete
                                    onClick={() => handleDeleteRecord(record.id)}
                                    className="delete-btn"
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Модальне вікно додавання */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Додати запис використання</h3>
                            <MdClose onClick={handleCloseModal} className="close-btn" />
                        </div>

                        <div className="form-group">
                            <div className="form-row">
                                <div>
                                    <label className="input-label">Об'єм (л):</label>
                                    <input type="number" value={newRecord.volume} onChange={(e) => handleInputChange('volume', e.target.value)} placeholder="500" min="0" className="form-input" />
                                </div>
                                <div>
                                    <label className="input-label">Дата:</label>
                                    <input type="date" value={newRecord.date} onChange={(e) => handleInputChange('date', e.target.value)} className="form-input" />
                                </div>
                            </div>

                            <div className="form-row">
                                <div>
                                    <label className="input-label">Тип:</label>
                                    <select value={newRecord.type} onChange={(e) => handleInputChange('type', e.target.value)} className="form-select">
                                        <option value="">Оберіть тип</option>
                                        <option value="Пожежа">Пожежа</option>
                                        <option value="Навчання">Навчання</option>
                                        <option value="Тренування">Тренування</option>
                                        <option value="Інше">Інше</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="input-label">Речовина:</label>
                                    <select value={newRecord.liquid} onChange={(e) => handleInputChange('liquid', e.target.value)} className="form-select">
                                        <option value="">Оберіть речовину</option>
                                        <option value="Піноутворювач">Піноутворювач</option>
                                        <option value="Порошок">Порошок</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="input-label">Адреса:</label>
                                <input type="text" value={newRecord.address} onChange={(e) => handleInputChange('address', e.target.value)} placeholder="вул. Шевченка, 10" className="form-input" />
                            </div>

                            <div className="modal-actions">
                                <button onClick={handleCloseModal} className="cancel-btn" disabled={isSaving}>Скасувати</button>
                                <button onClick={handleSaveRecord} disabled={isSaving} className="save-btn">
                                    {isSaving ? 'Збереження...' : 'Зберегти'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальне повідомлення */}
            {notification.open && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 51, padding: '1rem' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '0.5rem', padding: '1.5rem', maxWidth: '24rem', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: `2px solid ${notification.type === 'error' ? '#dc2626' : 'var(--gold)'}`, paddingBottom: '0.5rem' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', margin: 0, color: notification.type === 'error' ? '#dc2626' : 'var(--navy)' }}>
                                {notification.type === 'error' ? 'Увага' : 'Успіх'}
                            </h3>
                            <MdClose onClick={closeNotification} style={{ fontSize: '1.5rem', cursor: 'pointer', color: '#4b5563' }} />
                        </div>
                        <p style={{ color: '#374151', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>{notification.message}</p>
                        <button onClick={closeNotification} style={{ width: '100%', padding: '0.5rem 1rem', borderRadius: '0.25rem', fontWeight: 600, color: '#fff', cursor: 'pointer', border: 'none', backgroundColor: notification.type === 'error' ? '#dc2626' : 'var(--navy)', transition: 'opacity 0.2s' }}
                            onMouseEnter={(e) => e.target.style.opacity = '0.85'}
                            onMouseLeave={(e) => e.target.style.opacity = '1'}
                        >Закрити</button>
                    </div>
                </div>
            )}
        </>
    )
}

export default UsedExtenguishLiquids

function Totals({ usageRecords }) {
    const foamTotal = usageRecords
        .filter(r => r.substance === 'Піноутворювач')
        .reduce((s, r) => s + (Number(r.volume) || 0), 0);
    const powderTotal = usageRecords
        .filter(r => r.substance === 'Порошок')
        .reduce((s, r) => s + (Number(r.volume) || 0), 0);

    return (
        <div className="totals-grid">
            <div className="totals-card">
                <div>
                    <div className="totals-label">Піноутворювач використано</div>
                    <div className="totals-value">{foamTotal} л</div>
                </div>
            </div>
            <div className="totals-card">
                <div>
                    <div className="totals-label">Порошок використано</div>
                    <div className="totals-value">{powderTotal} кг</div>
                </div>
            </div>
        </div>
    )
}
