import React, { useState } from 'react';
import { toast } from 'react-toastify';
import '../scss/archivemodal.scss';

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
            toast.success('Обладнання успішно списано!');
            onClose();
        } catch (error) {
            console.error('Failed to archive:', error);
            const errorMsg = error.response?.data?.error || error.message;
            toast.error(`Помилка при списанні: ${errorMsg}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="archive-modal-overlay">
            <div className="archive-modal-content">
                <h3>Списати обладнання</h3>
                {itemName && (
                    <div className="modal-subtitle">
                        Ви обрали: <span>{itemName}</span>
                    </div>
                )}
                
                <form className='archive-form' onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Причина списання *</label>
                        <select 
                            value={writeOffReason} 
                            onChange={(e) => setWriteOffReason(e.target.value)}
                            required
                        >
                            <option value="Закінчився термін експлуатації">Закінчився термін експлуатації</option>
                            <option value="Не пройшло випробування / Деформація">Не пройшло випробування / Деформація</option>
                            <option value="Знищено/пошкоджено під час ліквідації НС">Знищено/пошкоджено під час ліквідації НС</option>
                            <option value="Втрачено">Втрачено</option>
                            <option value="Інше">Інше</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Номер Акта на списання *</label>
                        <input 
                            type="text" 
                            value={actNumber} 
                            onChange={(e) => setActNumber(e.target.value)}
                            placeholder="Напр. № 123-А"
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label>Посилання на скан-копію</label>
                        <input 
                            type="url" 
                            value={documentLink} 
                            onChange={(e) => setDocumentLink(e.target.value)}
                            placeholder="https://drive.google.com/..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Додаткові обставини</label>
                        <textarea 
                            value={writeOffExplanation} 
                            onChange={(e) => setWriteOffExplanation(e.target.value)}
                            placeholder="Деталі поломки чи списання..."
                        ></textarea>
                    </div>

                    <div className="archive-actions">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={isSaving}>
                            Скасувати
                        </button>
                        <button type="submit" className="btn-confirm" disabled={isSaving}>
                            {isSaving ? 'Списування...' : 'Списати обладнання'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ArchiveModal;
