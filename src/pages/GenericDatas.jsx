import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { fetchGenericDatas, fetchTransferLogs } from '../api/services.js';
import { TfiPrinter } from "react-icons/tfi";
import useApi from '../hooks/useApi.js';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import ErrorMessage from '../components/ui/ErrorMessage.jsx';
import ClosesTestitem from '../components/ClosesTestitem.jsx';
import Wastedtestitem from '../components/Wastedtestitem.jsx';
import TotalElectricStations from '../components/TotalElectricStations.jsx';
import TotalWaterPump from '../components/TotalWaterPump.jsx';
import TotalHydrauliktools from '../components/TotalHydrauliktools.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import LoginActivityChart from '../components/LoginActivityChart.jsx';
import '../scss/genericdatas.scss';

const GenericDatas = () => {
    const { user } = useAuth();
    const {
        data,
        loading,
        error,
        refetch
    } = useApi(() => fetchGenericDatas(), []);

    const [filterDetachmentId, setFilterDetachmentId] = useState('');
    const [recentTransfers, setRecentTransfers] = useState([]);
    const pageRef = useRef(null);

    const exportToPdf = () => {
        if (!pageRef.current) return;
        const opt = {
            margin: [0.3, 0.3, 0.3, 0.3],
            filename: 'Загальні_дані.pdf',
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
            pagebreak: {
                mode: ['avoid-all', 'css', 'legacy'],
                before: '.page-break-before', // клас для розриву перед елементом
               
                        
            }
        };
        html2pdf()
        .set(opt)
        .from(pageRef.current)
        .outputPdf('bloburl')
        .then((url) => {
            window.open(url, '_blank')
        })
    };

    // Fetch recent transfer logs
    useEffect(() => {
        const loadTransfers = async () => {
            try {
                const logs = await fetchTransferLogs();
                setRecentTransfers(logs.slice(0, 20));
            } catch (e) {
                console.error('Failed to load transfer logs:', e);
            }
        };
        loadTransfers();
    }, []);

    if (user?.role === 'RW') {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2 style={{ color: 'var(--danger)' }}>Доступ заборонено</h2>
                <p>Цей розділ доступний лише для керівництва (GOD, SEMI-GOD).</p>
            </div>
        );
    }

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} onRetry={refetch} />;
    if (!data) return null;

    let { upcoming, wasted } = data.tests || { upcoming: [], wasted: [] };
    let { foam, powder } = data.totalLiquids || { foam: [], powder: [] };
    let usedLiquids = data.usedLiquids || [];
    let electricStations = data.electricStations || [];
    let waterPumps = data.waterPumps || [];
    let hydrauliktools = data.hydrauliktools || [];

    const uniqueDetachments = data.detachments || [];
    const allDetachmentsMap = new Map(uniqueDetachments.map(d => [d.id, d.name]));

    const isMatch = (item) => {
        if (!filterDetachmentId) return true;
        return item.Brigade?.Detachment?.id === Number(filterDetachmentId);
    };

    wasted = wasted.filter(isMatch);
    upcoming = upcoming.filter(isMatch);
    foam = foam.filter(isMatch);
    powder = powder.filter(isMatch);
    usedLiquids = usedLiquids.filter(isMatch);
    electricStations = electricStations.filter(isMatch);
    waterPumps = waterPumps.filter(isMatch);
    hydrauliktools = hydrauliktools.filter(isMatch);

    const totalFoamPassed = foam.reduce((sum, item) => sum + (item.vehiclePassed || 0) + (item.wherehousePassed || 0), 0);
    const foamVehiclePassed = foam.reduce((sum, item) => sum + (item.vehiclePassed || 0), 0);
    const foamWarehousePassed = foam.reduce((sum, item) => sum + (item.wherehousePassed || 0), 0);

    const totalFoamNotPassed = foam.reduce((sum, item) => sum + (item.vehicleNotPassed || 0) + (item.wherehouseNotPassed || 0), 0);
    const foamVehicleNotPassed = foam.reduce((sum, item) => sum + (item.vehicleNotPassed || 0), 0);
    const foamWarehouseNotPassed = foam.reduce((sum, item) => sum + (item.wherehouseNotPassed || 0), 0);

    const totalPowderPassed = powder.reduce((sum, item) => sum + (item.vehiclePowderPassed || 0) + (item.werhousePowderPassed || 0), 0);
    const powderVehiclePassed = powder.reduce((sum, item) => sum + (item.vehiclePowderPassed || 0), 0);
    const powderWarehousePassed = powder.reduce((sum, item) => sum + (item.werhousePowderPassed || 0), 0);

    const totalPowderNotPassed = powder.reduce((sum, item) => sum + (item.vehiclePowderNotPassed || 0) + (item.werhousePowderNotPassed || 0), 0);
    const powderVehicleNotPassed = powder.reduce((sum, item) => sum + (item.vehiclePowderNotPassed || 0), 0);
    const powderWarehouseNotPassed = powder.reduce((sum, item) => sum + (item.werhousePowderNotPassed || 0), 0);

    const usedFoam = usedLiquids
        .filter(r => r.substance === 'Піноутворювач')
        .reduce((s, r) => s + (Number(r.volume) || 0), 0);
    const usedPowder = usedLiquids
        .filter(r => r.substance === 'Порошок')
        .reduce((s, r) => s + (Number(r.volume) || 0), 0);

    const getScopeTitle = () => {
        if (user?.role === 'SEMI-GOD') return '(Ваш загін)';
        if (!filterDetachmentId) return '(Всі підрозділи)';
        const detName = allDetachmentsMap.get(Number(filterDetachmentId));
        return `(${detName})`;
    };

    return (
        <div  style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className='no-print' style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    className='no-print'
                    onClick={exportToPdf}
                    style={{
                        padding: '0.5rem 1rem',
                        background: 'var(--navy)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '1.3rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                    }}
                >
                    <TfiPrinter />
                </button>
            </div>
            <LoginActivityChart />
            <div ref={pageRef} >
                <div>
                    <div className='gd-title-wrapp'>
                        {wasted.length > 0 ? (
                        <div className='gd-item-wrapp'>
                            <div><h3>Обладнання, яке не випробували {getScopeTitle()}</h3></div>
                            <div className='gd-item-header-row'>
                                <span>назва обладнання</span>
                                <span>інвентарний номер</span>
                                <span>дата до коли треба випробувати</span>
                                <span>приналежність</span>
                            </div>
                            {wasted.map(item => (
                                <Wastedtestitem key={item.id} item={item} />
                            ))}
                        </div>
                    ) : (
                        <h4 className='gd-green-bg' style={{ margin: 0 }}>Протермінованих випробувань немає.</h4>
                    )}
                </div>

                <div className='gd-item-wrapp' style={{ marginTop: '1rem' }}>
                    {upcoming.length > 0 ? (
                        <>
                            <div className='gd-header-title'>
                                <h2> Найближчі випробування {getScopeTitle()}</h2>
                            </div>
                            <div className='gd-item-header-row'>
                                <span>назва обладнання</span>
                                <span>інвентарний номер</span>
                                <span>дата до коли треба випробувати</span>
                                <span>приналежність</span>
                            </div>
                            {upcoming.map(item => (
                                <ClosesTestitem key={item.id} item={item} />
                            ))}
                        </>
                    ) : (
                        <p style={{ textAlign: 'center', padding: '1rem', color: 'green' }}>На найближчі 10 днів випробувань не заплановано.</p>
                    )}
                </div>
            </div>

            {/* 2. Total Extinguish Liquids */}
            <div ref={pageRef} className="gd-wrapper">
                <div className="gd-header" style={{ padding: '0 0 0.5rem 0' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: 0 }}>
                        Загальний запас вогнегасних речовин{' '}
                        {user?.role === 'GOD' ? (
                            <select
                                value={filterDetachmentId}
                                onChange={(e) => setFilterDetachmentId(e.target.value)}
                                style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '1rem', fontWeight: 'normal', border: '1px solid var(--gray-300)' }}
                            >
                                <option value="">Всі підрозділи</option>
                                {uniqueDetachments.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        ) : (
                            <span style={{ fontWeight: 'normal', fontSize: '1rem' }}>(Ваш загін)</span>
                        )}
                    </h3>
                </div>
                <div className="gd-totals-grid" style={{ marginTop: '1rem' }}>
                    <div className="gd-totals-card">
                        <div className='gd-tatal-liquid'>
                            <div className='gd-tatal-liquid-item'>
                                <div className="gd-totals-label">Піноутворювач (Придатний)</div>
                                <div className="gd-totals-value" style={{ color: 'var(--success)' }}>{totalFoamPassed} л</div>
                            </div>
                            <div className='gd-tatal-liquid-item'>
                                <div className="gd-totals-label-1">на автомобілях</div>
                                <div className="gd-totals-value" style={{ color: 'var(--success)' }}>{foamVehiclePassed} л</div>
                            </div>
                            <div className='gd-tatal-liquid-item'>
                                <div className="gd-totals-label-2"> На складі</div>
                                <div className="gd-totals-value" style={{ color: 'var(--success)' }}>{foamWarehousePassed} л</div>
                            </div>
                        </div>
                    </div>
                    <div className="gd-totals-card">
                        <div className='gd-tatal-liquid'>
                            <div className='gd-tatal-liquid-item'>
                                <div className="gd-totals-label">Піноутворювач (Непридатний)</div>
                                <div className="gd-totals-value" style={{ color: 'var(--danger)' }}>{totalFoamNotPassed} л</div>
                            </div>
                            <div className='gd-tatal-liquid-item'>
                                <div className="gd-totals-label-1">на автомобілях</div>
                                <div className="gd-totals-value" style={{ color: 'var(--danger)' }}>{foamVehicleNotPassed} л</div>
                            </div>
                            <div className='gd-tatal-liquid-item'>
                                <div className="gd-totals-label-2"> На складі</div>
                                <div className="gd-totals-value" style={{ color: 'var(--danger)' }}>{foamWarehouseNotPassed} л</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="gd-totals-grid" style={{ marginTop: '1rem' }}>
                    <div className="gd-totals-card">
                        <div className='gd-tatal-liquid'>
                            <div className='gd-tatal-liquid-item'>
                                <div className="gd-totals-label">Порошок (Придатний)</div>
                                <div className="gd-totals-value" style={{ color: 'var(--success)' }}>{totalPowderPassed} кг</div>
                            </div>
                            <div className='gd-tatal-liquid-item'>
                                <div className="gd-totals-label-1">на автомобілях</div>
                                <div className="gd-totals-value" style={{ color: 'var(--success)' }}>{powderVehiclePassed} кг</div>
                            </div>
                            <div className='gd-tatal-liquid-item'>
                                <div className="gd-totals-label-2"> На складі</div>
                                <div className="gd-totals-value" style={{ color: 'var(--success)' }}>{powderWarehousePassed} кг</div>
                            </div>
                        </div>
                    </div>
                    <div className="gd-totals-card">
                        <div className='gd-tatal-liquid'>
                            <div className='gd-tatal-liquid-item'>
                                <div className="gd-totals-label">Порошок (Непридатний)</div>
                                <div className="gd-totals-value" style={{ color: 'var(--danger)' }}>{totalPowderNotPassed} кг</div>
                            </div>
                            <div className='gd-tatal-liquid-item'>
                                <div className="gd-totals-label-1">на автомобілях</div>
                                <div className="gd-totals-value" style={{ color: 'var(--danger)' }}>{powderVehicleNotPassed} кг</div>
                            </div>
                            <div className='gd-tatal-liquid-item'>
                                <div className="gd-totals-label-2"> На складі</div>
                                <div className="gd-totals-value" style={{ color: 'var(--danger)' }}>{powderWarehouseNotPassed} кг</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Used Liquids */}
            <div className="gd-wrapper">
                <div className="gd-header" style={{ padding: '0 0 0.5rem 0', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        Використання з початку року {getScopeTitle()}
                    </h3>
                </div>
                <div className="gd-totals-grid" style={{ marginTop: '1rem' }}>
                    <div className="gd-totals-card"><div className='gd-tatal-liquid'>
                        <div className="gd-totals-label">Піноутворювач використано</div>
                        <div className="gd-totals-value">{usedFoam} л</div>
                    </div></div>
                    <div className="gd-totals-card"><div className='gd-tatal-liquid'>
                        <div className="gd-totals-label">Порошок використано</div>
                        <div className="gd-totals-value">{usedPowder} кг</div>
                    </div></div>
                </div>
                {usedLiquids.length > 0 && (
                    <div className="gd-records-list" style={{ marginTop: '1rem' }}>
                        {usedLiquids.map((record) => (
                            <div key={record.id} className="gd-record-card">
                                <div className="gd-record-field">
                                    <span className="gd-field-label">Підрозділ:</span>
                                    <span className="gd-field-value gd-highlight" style={{ color: 'var(--navy)' }}>{record.Brigade?.name || '—'}</span>
                                </div>
                                <div className="gd-record-divider"></div>
                                <div className="gd-record-field">
                                    <span className="gd-field-label">Об'єм:</span>
                                    <span className="gd-field-value gd-highlight">{record.volume}л</span>
                                </div>
                                <div className="gd-record-divider"></div>
                                <div className="gd-record-field">
                                    <span className="gd-field-label">Дата:</span>
                                    <span className="gd-field-value">{record.date}</span>
                                </div>
                                <div className="gd-record-divider"></div>
                                <div className="gd-record-field">
                                    <span className="gd-field-label">Речовина:</span>
                                    <span className="gd-field-value">{record.substance}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 4. Equipment Totals */}
            <TotalElectricStations electricStations={electricStations} />
            <TotalWaterPump waterPumps={waterPumps} />
            <TotalHydrauliktools tools={hydrauliktools} />

            {/* 5. Recent Transfer Logs 
            {recentTransfers.length > 0 && (
                <div className="gd-wrapper">
                    <div className="gd-header" style={{ padding: '0 0 0.5rem 0' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: 0 }}>Останні передачі майна</h3>
                    </div>
                    <div style={{ overflowX: 'auto', marginTop: '0.5rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                            <thead style={{ backgroundColor: 'var(--navy)', color: 'white' }}>
                                <tr>
                                    <th style={{ padding: '0.8rem', textAlign: 'center' }}>Назва</th>
                                    <th style={{ padding: '0.8rem', textAlign: 'center' }}>Тип</th>
                                    <th style={{ padding: '0.8rem', textAlign: 'center' }}>Звідки</th>
                                    <th style={{ padding: '0.8rem', textAlign: 'center' }}>Куди</th>
                                    <th style={{ padding: '0.8rem', textAlign: 'center' }}>Дата</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTransfers.map(log => (
                                    <tr key={log.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                                        <td style={{ padding: '0.7rem' }}><strong>{log.itemName}</strong></td>
                                        <td style={{ padding: '0.7rem' }}>{log.equipmentType}</td>
                                        <td style={{ padding: '0.7rem' }}>{log.FromBrigade?.name || '—'}</td>
                                        <td style={{ padding: '0.7rem' }}>{log.ToBrigade?.name || '—'}</td>
                                        <td style={{ padding: '0.7rem' }}>{new Date(log.transferDate).toLocaleDateString('uk-UA')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
                */}

            </div>
            {/* 1. Failed & Upcoming Tests */}
        </div>
    );
};

export default GenericDatas;