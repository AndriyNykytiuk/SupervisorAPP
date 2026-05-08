import React, { useState, useEffect, useRef } from 'react'
import { IoMdAddCircleOutline } from "react-icons/io";
import { MdClose } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import {
    fetchProtocolsByBrigade,
    createProtocol,
    deleteProtocol,
    uploadEquipmentDocument,
    deleteEquipmentDocument,
    openInternalDocumentLink,
} from '../api/services.js';
import '../scss/foamcomponent.scss';

const isInternalLink = (link) => /^\/api\/equipment-documents\/\d+\/download/.test(link || '');
const extractDocId = (link) => {
    const m = (link || '').match(/\/api\/equipment-documents\/(\d+)\/download/);
    return m ? Number(m[1]) : null;
};

const ExtenguisProtocols = ({ selectedBrigade }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [protocols, setProtocols] = useState([]);
    const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });
    const fileInputRef = useRef(null);

    const showNotification = (message, type = 'success') => setNotification({ open: true, message, type });
    const closeNotification = () => setNotification({ open: false, message: '', type: 'success' });

    const [newProtocol, setNewProtocol] = useState({ name: '', link: '' });

    const fetchProtocols = async () => {
        if (!selectedBrigade) return;
        try {
            const items = await fetchProtocolsByBrigade(selectedBrigade);
            setProtocols(items);
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

    const handlePdfUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type !== 'application/pdf') {
            showNotification('Тільки PDF', 'error');
            e.target.value = '';
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            showNotification('Файл більше 20MB', 'error');
            e.target.value = '';
            return;
        }
        setIsUploading(true);
        try {
            const doc = await uploadEquipmentDocument({
                equipmentType: 'ExtenguisProtocol',
                equipmentId: selectedBrigade,
                brigadeId: selectedBrigade,
                documentName: newProtocol.name?.trim() || file.name,
                file,
            });
            setNewProtocol((prev) => ({
                name: prev.name || doc.documentName,
                link: `/api/equipment-documents/${doc.id}/download`,
            }));
            showNotification('PDF завантажено — натисніть Зберегти', 'success');
        } catch (err) {
            showNotification(err.response?.data?.error || 'Помилка завантаження', 'error');
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const handleSaveProtocol = async () => {
        if (!newProtocol.name.trim() || !newProtocol.link.trim()) {
            showNotification('Будь ласка, заповніть всі поля', 'error');
            return;
        }
        setIsSaving(true);
        try {
            await createProtocol({ documentName: newProtocol.name, documentLink: newProtocol.link, brigadeId: selectedBrigade });
            await fetchProtocols();
            handleCloseModal();
            showNotification('Протокол успішно додано!', 'success');
        } catch (error) {
            console.error('Помилка при додаванні протоколу:', error);
            showNotification('Помилка при додаванні протоколу', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteProtocol = async (protocol) => {
        if (!confirm('Ви впевнені, що хочете видалити цей протокол?')) return;
        try {
            await deleteProtocol(protocol.id);
            // also remove file if this was an internal upload
            const docId = extractDocId(protocol.documentLink);
            if (docId) {
                try { await deleteEquipmentDocument(docId); } catch {}
            }
            await fetchProtocols();
        } catch (error) {
            console.error('Помилка при видаленні:', error);
            showNotification('Помилка при видаленні протоколу', 'error');
        }
    };

    const openProtocol = (protocol) => {
        if (isInternalLink(protocol.documentLink)) {
            openInternalDocumentLink(protocol.documentLink).catch(() => showNotification('Не вдалося відкрити документ', 'error'));
        } else {
            window.open(protocol.documentLink, '_blank', 'noopener,noreferrer');
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
                                <button
                                    type='button'
                                    onClick={() => openProtocol(protocol)}
                                    style={{ background: 'none', border: 'none', padding: 0, fontWeight: 500, color: '#374151', flex: 1, textAlign: 'left', cursor: 'pointer', font: 'inherit', transition: 'color 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--navy)'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
                                >
                                    📄 {protocol.documentName}
                                </button>
                                <AiOutlineDelete
                                    onClick={() => handleDeleteProtocol(protocol)}
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
                                <input type="text" value={newProtocol.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Наприклад: 2026 рік"
                                    style={{ width: '100%', border: '2px solid var(--navy)', borderRadius: '0.25rem', padding: '0.5rem 0.75rem', outline: 'none', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '0.5rem' }}>Посилання або файл:</label>
                                <input type="text" value={newProtocol.link} onChange={(e) => handleInputChange('link', e.target.value)} placeholder="https://... або завантажте PDF нижче"
                                    style={{ width: '100%', border: '2px solid var(--navy)', borderRadius: '0.25rem', padding: '0.5rem 0.75rem', outline: 'none', boxSizing: 'border-box', marginBottom: '0.5rem' }} />
                                <input ref={fileInputRef} type='file' accept='application/pdf' onChange={handlePdfUpload} style={{ display: 'none' }} />
                                <button
                                    type='button'
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading || !selectedBrigade}
                                    style={{ width: '100%', padding: '0.5rem 0.75rem', backgroundColor: 'var(--navy)', color: '#fff', border: 'none', borderRadius: '0.25rem', cursor: isUploading ? 'not-allowed' : 'pointer', fontWeight: 600 }}
                                >
                                    {isUploading ? 'Завантаження...' : 'додати PDF протоколу випробувань'}
                                </button>
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
