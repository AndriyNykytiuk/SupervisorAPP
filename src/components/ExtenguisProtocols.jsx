import React, { useState, useEffect } from 'react'
import { IoMdAddCircleOutline } from "react-icons/io";
import { MdClose } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import '../scss/foamcomponent.scss';

const ExtenguisProtocols = ({ selectedBrigade }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [protocols, setProtocols] = useState([]);
    const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });

    const showNotification = (message, type = 'success') => setNotification({ open: true, message, type });
    const closeNotification = () => setNotification({ open: false, message: '', type: 'success' });

    const [newProtocol, setNewProtocol] = useState({ name: '', link: '' });

    const fetchProtocols = async () => {
        if (!selectedBrigade) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/extenguis-document-links/brigade/${selectedBrigade}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const items = await res.json();
                setProtocols(items);
            }
        } catch (err) {
            console.error('Failed to fetch protocols:', err);
        }
    };

    useEffect(() => { fetchProtocols(); }, [selectedBrigade]);

    const handleInputChange = (field, value) => {
        setNewProtocol(prev => ({ ...prev, [field]: value }));
    };

    const handleOpenModal = () => {
        setNewProtocol({ name: '', link: '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setNewProtocol({ name: '', link: '' });
    };

    const handleSaveProtocol = async () => {
        if (!newProtocol.name.trim() || !newProtocol.link.trim()) {
            showNotification('Будь ласка, заповніть всі поля', 'error');
            return;
        }
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/extenguis-document-links', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ documentName: newProtocol.name, documentLink: newProtocol.link, brigadeId: selectedBrigade }),
            });
            if (res.ok) {
                await fetchProtocols();
                handleCloseModal();
                showNotification('Протокол успішно додано!', 'success');
            } else {
                showNotification('Помилка при додаванні протоколу', 'error');
            }
        } catch (error) {
            console.error('Помилка при додаванні протоколу:', error);
            showNotification('Помилка при додаванні протоколу', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteProtocol = async (id) => {
        if (!confirm('Ви впевнені, що хочете видалити цей протокол?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/extenguis-document-links/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                await fetchProtocols();
            } else {
                showNotification('Помилка при видаленні протоколу', 'error');
            }
        } catch (error) {
            console.error('Помилка при видаленні:', error);
            showNotification('Помилка при видаленні протоколу', 'error');
        }
    };

    return (
        <>
            <div className="foam-card protocols" style={{ marginLeft: '1rem', flex: 1 }}>
                <div className='foam-header' style={{ padding: '0 0 0.5rem 0', justifyContent: 'space-between' }}>
                    <h4 style={{ fontSize: '1.125rem' }}>Протоколи випробувань ПУ:</h4>
                    <IoMdAddCircleOutline
                        onClick={handleOpenModal}
                        className="add-icon"
                        style={{ fontSize: '1.5rem', cursor: 'pointer', color: 'var(--navy)', transition: 'color 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--navy)'}
                    />
                </div>
                <ul className="protocols-list" style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {protocols.length === 0 ? (
                        <li style={{ padding: '0.75rem', backgroundColor: '#fff', borderRadius: '0.25rem', border: '1px solid #d1d5db', textAlign: 'center', color: '#6b7280', fontStyle: 'italic' }}>
                            Немає протоколів
                        </li>
                    ) : (
                        protocols.map((protocol) => (
                            <li key={protocol.id}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#fff', borderRadius: '0.25rem', border: '1px solid #d1d5db', transition: 'border-color 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--gold)'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                            >
                                <a href={protocol.documentLink} target="_blank" rel="noopener noreferrer"
                                    style={{ fontWeight: 500, color: '#374151', flex: 1, textDecoration: 'none', transition: 'color 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--navy)'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
                                >
                                    📄 {protocol.documentName}
                                </a>
                                <AiOutlineDelete
                                    onClick={() => handleDeleteProtocol(protocol.id)}
                                    style={{ color: '#dc2626', cursor: 'pointer', marginLeft: '0.5rem', transition: 'color 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#991b1b'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#dc2626'}
                                />
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {/* Модальне вікно додавання */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '0.5rem', padding: '1.5rem', maxWidth: '28rem', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px solid var(--gold)', paddingBottom: '0.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--navy)', margin: 0 }}>Додати протокол</h3>
                            <MdClose onClick={handleCloseModal} style={{ fontSize: '1.5rem', cursor: 'pointer', color: '#4b5563' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#dc2626'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#4b5563'}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '0.5rem' }}>Назва протоколу:</label>
                                <input type="text" value={newProtocol.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Наприклад: 2024 рік"
                                    style={{ width: '100%', border: '2px solid var(--navy)', borderRadius: '0.25rem', padding: '0.5rem 0.75rem', outline: 'none', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '0.5rem' }}>Посилання на протокол:</label>
                                <input type="url" value={newProtocol.link} onChange={(e) => handleInputChange('link', e.target.value)} placeholder="https://example.com/protocol.pdf"
                                    style={{ width: '100%', border: '2px solid var(--navy)', borderRadius: '0.25rem', padding: '0.5rem 0.75rem', outline: 'none', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem' }}>
                                <button onClick={handleCloseModal} disabled={isSaving} style={{ flex: 1, padding: '0.5rem 1rem', border: '2px solid #d1d5db', color: '#374151', borderRadius: '0.25rem', fontWeight: 600, cursor: 'pointer', backgroundColor: 'transparent' }}>Скасувати</button>
                                <button onClick={handleSaveProtocol} disabled={isSaving} style={{ flex: 1, padding: '0.5rem 1rem', borderRadius: '0.25rem', fontWeight: 600, color: '#fff', cursor: isSaving ? 'not-allowed' : 'pointer', backgroundColor: isSaving ? '#9ca3af' : 'var(--navy)', border: 'none' }}>
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

export default ExtenguisProtocols
