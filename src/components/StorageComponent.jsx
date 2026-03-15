import React, { useState, useEffect } from 'react'
import { AiOutlineEdit } from "react-icons/ai";
import { MdSaveAlt, MdClose } from "react-icons/md";
import ExtenguisProtocols from './ExtenguisProtocols';
import '../scss/foamcomponent.scss';

const StorageComponent = ({ foamData, onSave, selectedBrigade }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Стан для модального повідомлення
    const [modal, setModal] = useState({ open: false, message: '', type: 'success' });

    const showModal = (message, type = 'success') => {
        setModal({ open: true, message, type });
    };

    const closeModal = () => {
        setModal({ open: false, message: '', type: 'success' });
    };

    // Стан для даних (маппінг з моделі)
    const [data, setData] = useState({
        canisters: 0,
        barrels: 0,
        eurocubes: 0
    });

    const [editData, setEditData] = useState({ ...data });

    // Синхронізація з пропом foamData
    useEffect(() => {
        if (foamData) {
            const mapped = {
                canisters: foamData.cannisteroVolume || 0,
                barrels: foamData.barrelVolume || 0,
                eurocubes: foamData.ibcVolume || 0
            };
            setData(mapped);
            setEditData(mapped);
        } else {
            const empty = { canisters: 0, barrels: 0, eurocubes: 0 };
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
        // Крос-валідація: totalFoamStorages повинен дорівнювати warehouseTotal
        const newStorageTotal = editData.canisters + editData.barrels + editData.eurocubes;
        const currentWarehouseTotal = (foamData?.wherehousePassed || 0) + (foamData?.wherehouseNotPassed || 0);

        if (currentWarehouseTotal > 0 && newStorageTotal !== currentWarehouseTotal) {
            showModal(`Треба виправити значення: обʼєм в ємностях (${newStorageTotal} л) не дорівнює ПУ на складі (${currentWarehouseTotal} л).`, 'error');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                cannisteroVolume: editData.canisters,
                barrelVolume: editData.barrels,
                ibcVolume: editData.eurocubes
            };
            const ok = await onSave(payload);
            if (ok) {
                setIsEditing(false);
                showModal('Успішно збережено!', 'success');
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

    const totalFoamStorages = data.canisters + data.barrels + data.eurocubes;
    const warehouseTotal = (foamData?.wherehousePassed || 0) + (foamData?.wherehouseNotPassed || 0);
    const mismatch = warehouseTotal > 0 && totalFoamStorages !== warehouseTotal;

    return (
        <div className="foam-wrapper" style={{ marginTop: '2rem' }}>
            <div className="foam-content">
                <div className="foam-card">
                    <div className='foam-header' style={{ padding: '0 0 0.5rem 0', justifyContent: 'space-between' }}>
                        <h4 style={{ fontSize: '1.125rem' }}>
                            Зберігання ПУ: <span style={{ color: mismatch ? 'red' : 'inherit' }}>на складі {warehouseTotal} л</span>
                            {mismatch && ` (ємності: ${totalFoamStorages} л)`}
                        </h4>
                        {isEditing ? (
                            <div className="edit-actions">
                                <button
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                >
                                    ✕
                                </button>
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

                    <div className="card-body">
                        <div className="card-row" style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
                            <span className="label">Каністри:</span>
                            {isEditing ? (
                                <input
                                    type="number"
                                    value={editData.canisters}
                                    onChange={(e) => handleInputChange('canisters', e.target.value)}
                                    className="input-val" style={{ color: 'var(--navy)' }}
                                    min="0"
                                />
                            ) : (
                                <span style={{ fontWeight: 'bold', color: 'var(--navy)' }}>{data.canisters}</span>
                            )}
                        </div>
                        <div className="card-row" style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
                            <span className="label">Бочки:</span>
                            {isEditing ? (
                                <input
                                    type="number"
                                    value={editData.barrels}
                                    onChange={(e) => handleInputChange('barrels', e.target.value)}
                                    className="input-val" style={{ color: 'var(--navy)' }}
                                    min="0"
                                />
                            ) : (
                                <span style={{ fontWeight: 'bold', color: 'var(--navy)' }}>{data.barrels}</span>
                            )}
                        </div>
                        <div className="card-row" style={{ padding: '0.5rem' }}>
                            <span className="label">Єврокуб:</span>
                            {isEditing ? (
                                <input
                                    type="number"
                                    value={editData.eurocubes}
                                    onChange={(e) => handleInputChange('eurocubes', e.target.value)}
                                    className="input-val" style={{ color: 'var(--navy)' }}
                                    min="0"
                                />
                            ) : (
                                <span style={{ fontWeight: 'bold', color: 'var(--navy)' }}>{data.eurocubes}</span>
                            )}
                        </div>
                    </div>
                </div>
                <ExtenguisProtocols selectedBrigade={selectedBrigade} />
            </div>

            {/* Модальне вікно повідомлення */}
            {modal.open && (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 50, padding: '1rem'
                }}>
                    <div style={{
                        backgroundColor: '#fff', borderRadius: '0.5rem', padding: '1.5rem',
                        maxWidth: '24rem', width: '100%',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            marginBottom: '1rem',
                            borderBottom: `2px solid ${modal.type === 'error' ? '#dc2626' : 'var(--gold)'}`,
                            paddingBottom: '0.5rem'
                        }}>
                            <h3 style={{
                                fontSize: '1.125rem', fontWeight: 'bold', margin: 0,
                                color: modal.type === 'error' ? '#dc2626' : 'var(--navy)'
                            }}>
                                
                            </h3>
                            <MdClose
                                onClick={closeModal}
                                style={{ fontSize: '1.5rem', cursor: 'pointer', color: '#4b5563', transition: 'color 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#dc2626'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#4b5563'}
                            />
                        </div>

                        <p style={{ color: '#374151', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
                            {modal.message}
                        </p>

                        <button
                            onClick={closeModal}
                            style={{
                                width: '100%', padding: '0.5rem 1rem', borderRadius: '0.25rem',
                                fontWeight: 600, color: '#fff', cursor: 'pointer', border: 'none',
                                backgroundColor: modal.type === 'error' ? '#dc2626' : 'var(--navy)',
                                transition: 'opacity 0.2s'
                            }}
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

export default StorageComponent
