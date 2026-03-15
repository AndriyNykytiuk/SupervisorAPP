import React, { useState, useEffect } from 'react'
import { AiOutlineEdit } from "react-icons/ai";
import { MdSaveAlt, MdClose } from "react-icons/md";
import '../scss/foamcomponent.scss';

const FoamComponent = ({ foamData, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [modal, setModal] = useState({ open: false, message: '', type: 'success' });

    const showModal = (message, type = 'success') => setModal({ open: true, message, type });
    const closeModal = () => setModal({ open: false, message: '', type: 'success' });

    const [data, setData] = useState({
        carsPassedTests: 0,
        carsFailedTests: 0,
        warehousePassedTests: 0,
        warehouseFailedTests: 0
    });

    const [editData, setEditData] = useState({ ...data });

    useEffect(() => {
        if (foamData) {
            const mapped = {
                carsPassedTests: foamData.vehiclePassed || 0,
                carsFailedTests: foamData.vehicleNotPassed || 0,
                warehousePassedTests: foamData.wherehousePassed || 0,
                warehouseFailedTests: foamData.wherehouseNotPassed || 0
            };
            setData(mapped);
            setEditData(mapped);
        } else {
            const empty = { carsPassedTests: 0, carsFailedTests: 0, warehousePassedTests: 0, warehouseFailedTests: 0 };
            setData(empty);
            setEditData(empty);
        }
    }, [foamData]);

    const handleInputChange = (field, value) => {
        setEditData(prev => ({
            ...prev,
            [field]: parseInt(value) || 0
        }));
    };

    const handleSave = async () => {
        const newWarehouseTotal = editData.warehousePassedTests + editData.warehouseFailedTests;
        const currentStorageTotal = (foamData?.cannisteroVolume || 0) + (foamData?.barrelVolume || 0) + (foamData?.ibcVolume || 0);

        setIsSaving(true);
        try {
            const payload = {
                vehiclePassed: editData.carsPassedTests,
                vehicleNotPassed: editData.carsFailedTests,
                wherehousePassed: editData.warehousePassedTests,
                wherehouseNotPassed: editData.warehouseFailedTests
            };
            const ok = await onSave(payload);
            if (ok) {
                setIsEditing(false);
                showModal('Дані успішно збережено!', 'success');
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

    const totalVehicle = data.carsPassedTests + data.carsFailedTests;
    const warehouseTotal = data.warehousePassedTests + data.warehouseFailedTests;
    const totalFoam = totalVehicle + warehouseTotal;

    return (
        <div className="foam-wrapper">
            <div className='foam-header'>
                <h3>Піноутворювач</h3>
                <span>{totalFoam} л</span>
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
                {/* На автомобілях */}
                <div className="foam-card">
                    <h4>На автомобілях: {totalVehicle} л</h4>
                    <div className="card-body">
                        <div className="card-row">
                            <span className="label">Пройшов випробування:</span>
                            {isEditing ? (
                                <input
                                    type="number"
                                    value={editData.carsPassedTests}
                                    onChange={(e) => handleInputChange('carsPassedTests', e.target.value)}
                                    className="input-val green"
                                    min="0"
                                />
                            ) : (
                                <span className="val-green">{data.carsPassedTests}</span>
                            )}
                        </div>
                        <div className="card-row">
                            <span className="label">Не пройшов випробування:</span>
                            {isEditing ? (
                                <input
                                    type="number"
                                    value={editData.carsFailedTests}
                                    onChange={(e) => handleInputChange('carsFailedTests', e.target.value)}
                                    className="input-val red"
                                    min="0"
                                />
                            ) : (
                                <span className="val-red">{data.carsFailedTests}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* На складі */}
                <div className="foam-card">
                    <h4>На складі: {warehouseTotal} л</h4>
                    <div className="card-body">
                        <div className="card-row">
                            <span className="label">Пройшов випробування:</span>
                            {isEditing ? (
                                <input
                                    type="number"
                                    value={editData.warehousePassedTests}
                                    onChange={(e) => handleInputChange('warehousePassedTests', e.target.value)}
                                    className="input-val green"
                                    min="0"
                                />
                            ) : (
                                <span className="val-green">{data.warehousePassedTests}</span>
                            )}
                        </div>
                        <div className="card-row">
                            <span className="label">Не пройшов випробування:</span>
                            {isEditing ? (
                                <input
                                    type="number"
                                    value={editData.warehouseFailedTests}
                                    onChange={(e) => handleInputChange('warehouseFailedTests', e.target.value)}
                                    className="input-val red"
                                    min="0"
                                />
                            ) : (
                                <span className="val-red">{data.warehouseFailedTests}</span>
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

export default FoamComponent
