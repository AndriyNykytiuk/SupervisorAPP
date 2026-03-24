import React, { useState } from 'react';

const ArchiveModal = ({ isOpen, onClose, onConfirm, itemName }) => {
    const [writeOffReason, setWriteOffReason] = useState('Закінчився термін експлуатації');
    const [writeOffExplanation, setWriteOffExplanation] = useState('');
    const [actNumber, setActNumber] = useState('');
    const [documentLink, setDocumentLink] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onConfirm({ writeOffReason, writeOffExplanation, actNumber, documentLink });
            onClose();
        } catch (error) {
            console.error('Failed to archive:', error);
            alert('Помилка при списанні: ' + (error.response?.data?.error || error.message));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content archive-modal" style={{ maxWidth: '500px' }}>
                <h3>Списати обладнання</h3>
                {itemName && <p style={{ marginBottom: '1rem', color: 'var(--navy)', fontWeight: 'bold' }}>{itemName}</p>}
                
                <form className='add-form' onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>Причина списання *</label>
                        <select 
                            value={writeOffReason} 
                            onChange={(e) => setWriteOffReason(e.target.value)}
                            required
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--gray-300)' }}
                        >
                            <option value="Закінчився термін експлуатації">Закінчився термін експлуатації</option>
                            <option value="Не пройшло випробування / Деформація">Не пройшло випробування / Деформація</option>
                            <option value="Знищено/пошкоджено під час ліквідації НС">Знищено/пошкоджено під час ліквідації НС</option>
                            <option value="Втрачено">Втрачено</option>
                            <option value="Інше">Інше</option>
                        </select>
                    </div>

                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>Номер Акта на списання *</label>
                        <input 
                            type="text" 
                            value={actNumber} 
                            onChange={(e) => setActNumber(e.target.value)}
                            placeholder="Напр. № 123-А"
                            required 
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--gray-300)' }}
                        />
                    </div>

                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>Посилання на скан-копію (необов'язково)</label>
                        <input 
                            type="url" 
                            value={documentLink} 
                            onChange={(e) => setDocumentLink(e.target.value)}
                            placeholder="https://drive.google.com/..."
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--gray-300)' }}
                        />
                    </div>

                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>Додаткові обставини</label>
                        <textarea 
                            value={writeOffExplanation} 
                            onChange={(e) => setWriteOffExplanation(e.target.value)}
                            placeholder="Деталі поломки чи списання..."
                            rows="3"
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--gray-300)', resize: 'vertical' }}
                        ></textarea>
                    </div>

                    <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} disabled={isSaving} style={{ padding: '0.5rem 1rem', border: 'none', background: 'var(--gray-200)', borderRadius: '4px', cursor: 'pointer' }}>
                            Скасувати
                        </button>
                        <button type="submit" disabled={isSaving} style={{ padding: '0.5rem 1rem', border: 'none', background: '#ef4444', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                            {isSaving ? 'Списування...' : 'Списати'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ArchiveModal;
