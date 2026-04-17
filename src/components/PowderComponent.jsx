import React, { useState, useEffect } from 'react'
import { AiOutlineEdit } from "react-icons/ai";
import { MdSaveAlt, MdClose } from "react-icons/md";
import { toast } from 'react-toastify';
import '../scss/foamcomponent.scss';

const PowderComponent = ({ powderData, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

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
                toast.success('Дані порошку успішно збережено!');
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

    const currentData = isEditing ? editData : data;
    const totalVehicle = Number(currentData.carsPassedPowder || 0) + Number(currentData.carsFailedPowder || 0);
    const warehouseTotal = Number(currentData.warehousePassedPowder || 0) + Number(currentData.warehouseFailedPowder || 0);
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
        </div>
    )
}

export default PowderComponent
