import React, { useState, useEffect } from 'react'
import { AiOutlineEdit } from "react-icons/ai";
import { MdSaveAlt, MdClose } from "react-icons/md";
import { toast } from 'react-toastify';
import '../scss/foamcomponent.scss';

const FoamComponent = ({ foamData, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

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
                toast.success('Дані успішно збережено!');
            } else {
                toast.error('Помилка при збереженні');
            }
        } catch (error) {
            console.error('Помилка при збереженні:', error);
            toast.error('Помилка при збереженні даних');
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
        </div>
    )
}

export default FoamComponent
