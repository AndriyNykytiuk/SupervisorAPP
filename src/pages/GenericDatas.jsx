import React, { useState } from 'react';
import { fetchGenericDatas } from '../api/services.js';
import useApi from '../hooks/useApi.js';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import ErrorMessage from '../components/ui/ErrorMessage.jsx';
import ClosesTestitem from '../components/ClosesTestitem.jsx';
import Wastedtestitem from '../components/Wastedtestitem.jsx';
import TotalElectricStations from '../components/TotalElectricStations.jsx';
import TotalWaterPump from '../components/TotalWaterPump.jsx';
import TotalHydrauliktools from '../components/TotalHydrauliktools.jsx';
import { useAuth } from '../context/AuthContext.jsx';
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

    // All detachments from the database
    const uniqueDetachments = data.detachments || [];
    const allDetachmentsMap = new Map(uniqueDetachments.map(d => [d.id, d.name]));

    // Helper to filter data by detachment
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

    // ── Aggregation Logic ──
    const totalFoamPassed = foam.reduce((sum, item) => sum + (item.vehiclePassed || 0) + (item.wherehousePassed || 0), 0);
    const totalFoamNotPassed = foam.reduce((sum, item) => sum + (item.vehicleNotPassed || 0) + (item.wherehouseNotPassed || 0), 0);
    
    const totalPowderPassed = powder.reduce((sum, item) => sum + (item.vehiclePowderPassed || 0) + (item.werhousePowderPassed || 0), 0);
    const totalPowderNotPassed = powder.reduce((sum, item) => sum + (item.vehiclePowderNotPassed || 0) + (item.werhousePowderNotPassed || 0), 0);

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* 1. Div Closes Test and Failed Test */}
            <div>
                <div className='gd-title-wrapp'>
                    {wasted.length > 0 ? (
                        <div className='gd-item-wrapp'>
                            <div>
                                <h3>Обладнання, яке не випробували {getScopeTitle()}</h3>
                            </div>
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

            {/* 2. Div Total Extenguis Liquids */}
            <div className="gd-wrapper">
                <div className="gd-header" style={{ padding: '0 0 0.5rem 0' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: 0 }}>
                        Загальний запас вогнегасних речовин                         {user?.role === 'GOD' ? (
                            <select 
                                value={filterDetachmentId} 
                                onChange={(e) => setFilterDetachmentId(e.target.value)}
                                style={{ 
                                    padding: '0.2rem 0.5rem', 
                                    borderRadius: '4px', 
                                    fontSize: '1rem', 
                                    fontWeight: 'normal',
                                    border: '1px solid var(--gray-300)'
                                }}
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
                        <div>
                            <div className="gd-totals-label">Піноутворювач (Придатний)</div>
                            <div className="gd-totals-value" style={{ color: 'var(--success)' }}>{totalFoamPassed} л</div>
                        </div>
                    </div>
                    <div className="gd-totals-card">
                        <div>
                            <div className="gd-totals-label">Піноутворювач (Непридатний)</div>
                            <div className="gd-totals-value" style={{ color: 'var(--danger)' }}>{totalFoamNotPassed} л</div>
                        </div>
                    </div>
                </div>
                <div className="gd-totals-grid" style={{ marginTop: '1rem' }}>
                    <div className="gd-totals-card">
                        <div>
                            <div className="gd-totals-label">Порошок (Придатний)</div>
                            <div className="gd-totals-value" style={{ color: 'var(--success)' }}>{totalPowderPassed} кг</div>
                        </div>
                    </div>
                    <div className="gd-totals-card">
                        <div>
                            <div className="gd-totals-label">Порошок (Непридатний)</div>
                            <div className="gd-totals-value" style={{ color: 'var(--danger)' }}>{totalPowderNotPassed} кг</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Div Used Extenguish Liquids */}
            <div className="gd-wrapper">
                <div className="gd-header" style={{ padding: '0 0 0.5rem 0', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        Використання з початку року {getScopeTitle()}
                        

                    </h3>
                </div>
                <div className="gd-totals-grid" style={{ marginTop: '1rem' }}>
                    <div className="gd-totals-card">
                        <div>
                            <div className="gd-totals-label">Піноутворювач використано</div>
                            <div className="gd-totals-value">{usedFoam} л</div>
                        </div>
                    </div>
                    <div className="gd-totals-card">
                        <div>
                            <div className="gd-totals-label">Порошок використано</div>
                            <div className="gd-totals-value">{usedPowder} кг</div>
                        </div>
                    </div>
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

            {/* 4. Div Total Electric Stations */}
            <TotalElectricStations electricStations={electricStations} />
            <TotalWaterPump waterPumps={waterPumps} />
            <TotalHydrauliktools tools={hydrauliktools} />
        </div>
    );
};

export default GenericDatas;