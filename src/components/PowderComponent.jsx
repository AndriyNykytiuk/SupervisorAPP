import React, { useState, useEffect } from 'react'
import { AiOutlineEdit } from "react-icons/ai";
import { MdSaveAlt, MdClose } from "react-icons/md";
import '../scss/foamcomponent.scss';

const PowderComponent = ({ powderData, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [modal, setModal] = useState({ open: false, message: '', type: 'success' });

    const showModal = (message, type = 'success') => setModal({ open: true, message, type });
    const closeModal = () => setModal({ open: false, message: '', type: 'success' });

    const [data, setData] = useState({
        carsPassedPowder: 0,
        carsFailedPowder: 0,
        warehousePassedPowder: 0,
        warehouseFailedPowder: 0
    });

    const [editData, setEditData] = useState({ ...data });

    useEffect(() => {
        if (powderData) {
            const mapped = {
                carsPassedPowder: powderData.vehiclePowderPassed || 0,
                carsFailedPowder: powderData.vehiclePowderNotPassed || 0,
                warehousePassedPowder: powderData.werhousePowderPassed || 0,
                warehouseFailedPowder: powderData.werhousePowderNotPassed || 0
            };
            setData(mapped);
            setEditData(mapped);
        } else {
            const empty = { carsPassedPowder: 0, carsFailedPowder: 0, warehousePassedPowder: 0, warehouseFailedPowder: 0 };
            setData(empty);
            setEditData(empty);
        }
    }, [powderData]);

    const handleInputChange = (field, value) => {
        setEditData(prev => ({
            ...prev,
            [field]: parseInt(value) || 0
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = {
                vehiclePowderPassed: editData.carsPassedPowder,
                vehiclePowderNotPassed: editData.carsFailedPowder,
                werhousePowderPassed: editData.warehousePassedPowder,
                werhousePowderNotPassed: editData.warehouseFailedPowder
            };
            const ok = await onSave(payload);
            if (ok) {
                setIsEditing(false);
                showModal('Дані порошку успішно збережено!', 'success');
            } else {
                showModal('Помилка при збереженні', 'error');
            }
        } catch (error) {
            console.error('Помилка при збереженні:', error);
            showModal('Помилка при збереженні даних', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditData({ ...data });
        setIsEditing(false);
    };

    const totalVehicle = data.carsPassedPowder + data.carsFailedPowder;
    const warehouseTotal = data.warehousePassedPowder + data.warehouseFailedPowder;
    const totalPowder = totalVehicle + warehouseTotal;

    return (
        <div className="foam-wrapper">
            <div className='foam-header'>
                <h3>Порошок</h3>
                <span>{totalPowder} кг</span>
                {isEditing ? (
                    <div className="edit-actions">
                        <button onClick={handleCancel} disabled={isSaving}>✕</button>
                        <MdSaveAlt
                            onClick={handleSave}
                            className={`save-icon ${isSaving ? 'disabled' : ''}`}
                        />
                    </div>
                ) : (
                    <AiOutlineEdit
                        onClick={() => setIsEditing(true)}
                        className="edit-icon"
                    />
                )}
            </div>

            <div className="foam-content">
                <div className="foam-card">
                    <h4>На автомобілях: {totalVehicle} кг</h4>
                    <div className="card-body">
                        <div className="card-row">
                            <span className="label">Пройшов випробування:</span>
                            {isEditing ? (
                                <input type="number" value={editData.carsPassedPowder} onChange={(e) => handleInputChange('carsPassedPowder', e.target.value)} className="input-val green" min="0" />
                            ) : (
                                <span className="val-green">{data.carsPassedPowder}</span>
                            )}
                        </div>
                        <div className="card-row">
                            <span className="label">Не пройшов випробування:</span>
                            {isEditing ? (
                                <input type="number" value={editData.carsFailedPowder} onChange={(e) => handleInputChange('carsFailedPowder', e.target.value)} className="input-val red" min="0" />
                            ) : (
                                <span className="val-red">{data.carsFailedPowder}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="foam-card">
                    <h4>На складі: {warehouseTotal} кг</h4>
                    <div className="card-body">
                        <div className="card-row">
                            <span className="label">Пройшов випробування:</span>
                            {isEditing ? (
                                <input type="number" value={editData.warehousePassedPowder} onChange={(e) => handleInputChange('warehousePassedPowder', e.target.value)} className="input-val green" min="0" />
                            ) : (
                                <span className="val-green">{data.warehousePassedPowder}</span>
                            )}
                        </div>
                        <div className="card-row">
                            <span className="label">Не пройшов випробування:</span>
                            {isEditing ? (
                                <input type="number" value={editData.warehouseFailedPowder} onChange={(e) => handleInputChange('warehouseFailedPowder', e.target.value)} className="input-val red" min="0" />
                            ) : (
                                <span className="val-red">{data.warehouseFailedPowder}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Модальне вікно */}
            {modal.open && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '0.5rem', padding: '1.5rem', maxWidth: '24rem', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: `2px solid ${modal.type === 'error' ? '#dc2626' : 'var(--gold)'}`, paddingBottom: '0.5rem' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', margin: 0, color: modal.type === 'error' ? '#dc2626' : 'var(--navy)' }}>
                                {modal.type === 'error' ? '⚠️ Увага' : '✅ Успіх'}
                            </h3>
                            <MdClose onClick={closeModal} style={{ fontSize: '1.5rem', cursor: 'pointer', color: '#4b5563' }} />
                        </div>
                        <p style={{ color: '#374151', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>{modal.message}</p>
                        <button onClick={closeModal} style={{ width: '100%', padding: '0.5rem 1rem', borderRadius: '0.25rem', fontWeight: 600, color: '#fff', cursor: 'pointer', border: 'none', backgroundColor: modal.type === 'error' ? '#dc2626' : 'var(--navy)', transition: 'opacity 0.2s' }}
                            onMouseEnter={(e) => e.target.style.opacity = '0.85'}
                            onMouseLeave={(e) => e.target.style.opacity = '1'}
                        >
                            Закрити
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PowderComponent
