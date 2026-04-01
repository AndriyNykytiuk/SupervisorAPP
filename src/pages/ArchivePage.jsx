import React, { useEffect, useState } from 'react';
import { fetchArchivedEquipment, fetchTransferLogs, fetchTransferBrigades } from '../api/services.js';

import '../scss/archivepage.scss';

const ArchivePage = () => {
    const [activeTab, setActiveTab] = useState('wasted');
    const [archives, setArchives] = useState([]);
    const [transfers, setTransfers] = useState([]);
    const [brigades, setBrigades] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [filterBrigadeId, setFilterBrigadeId] = useState('');

    // Load brigades once
    useEffect(() => {
        const loadBrigades = async () => {
            try {
                const dets = await fetchTransferBrigades();
                const allBrigades = [];
                dets.forEach(det => {
                    det.Brigades?.forEach(b => allBrigades.push({ ...b, detachmentName: det.name }));
                });
                setBrigades(allBrigades);
            } catch (e) {
                console.error('Failed to load brigades:', e);
            }
        };
        loadBrigades();
    }, []);

    // Load data when tab or filters change
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                if (activeTab === 'wasted') {
                    const data = await fetchArchivedEquipment();
                    setArchives(data);
                } else {
                    const params = {};
                    if (dateFrom) params.from = dateFrom;
                    if (dateTo) params.to = dateTo;
                    if (filterBrigadeId) params.brigadeId = filterBrigadeId;
                    const data = await fetchTransferLogs(params);
                    setTransfers(data);
                }
            } catch (error) {
                console.error('Failed to load data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [activeTab, dateFrom, dateTo, filterBrigadeId]);

    // Filter wasted items client-side
    const filteredArchives = archives.filter(item => {
        if (filterBrigadeId && item.brigadeId !== Number(filterBrigadeId)) return false;
        if (dateFrom && new Date(item.writeOffDate) < new Date(dateFrom)) return false;
        if (dateTo) {
            const to = new Date(dateTo);
            to.setHours(23, 59, 59, 999);
            if (new Date(item.writeOffDate) > to) return false;
        }
        return true;
    });

    return (
        <div className="archive-page" data-tab={activeTab}>
            <h2 className="gd-title-wrapp">Архів</h2>

            {/* ─── Tab Buttons ─── */}
            <div className="archive-tabs">
                <button
                    className={`archive-tab-btn ${activeTab === 'wasted' ? 'active' : ''}`}
                    onClick={() => setActiveTab('wasted')}
                >
                    Списане майно
                </button>
                <button
                    className={`archive-tab-btn ${activeTab === 'transferred' ? 'active' : ''}`}
                    onClick={() => setActiveTab('transferred')}
                >
                    Передане майно
                </button>
            </div>

            {/* ─── Filters ─── */}
            <div className="archive-filters">
                <div className="archive-filter-group">
                    <label>Від:</label>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                </div>
                <div className="archive-filter-group">
                    <label>До:</label>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                </div>
                <div className="archive-filter-group">
                    <label>Частина:</label>
                    <select value={filterBrigadeId} onChange={e => setFilterBrigadeId(e.target.value)}>
                        <option value="">Всі частини</option>
                        {brigades.map(b => (
                            <option key={b.id} value={b.id}>{b.detachmentName} — {b.name}</option>
                        ))}
                    </select>
                </div>
                {(dateFrom || dateTo || filterBrigadeId) && (
                    <button className="archive-clear-btn" onClick={() => { setDateFrom(''); setDateTo(''); setFilterBrigadeId(''); }}>
                        ✕ Скинути
                    </button>
                )}
            </div>

            {loading ? (
                <div className="archive-loading">Завантаження...</div>
            ) : activeTab === 'wasted' ? (
                /* ─── Wasted Items Table ─── */
                <div className="archive-list">
                    {filteredArchives.length === 0 ? (
                        <p className="archive-empty">Списаного майна не знайдено</p>
                    ) : (
                        <table className="archive-table">
                            <thead>
                                <tr>
                                    <th>Назва</th>
                                    <th>Інв. номер</th>
                                    <th>Частина</th>
                                    <th>Дата списання</th>
                                    <th>Причина</th>
                                    <th>Акт</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredArchives.map(item => (
                                    <tr key={item.id}>
                                        <td><strong>{item.name}</strong></td>
                                        <td>{item.inventoryNumber || '—'}</td>
                                        <td>{item.Brigade?.name || `ID: ${item.brigadeId}`}</td>
                                        <td>{new Date(item.writeOffDate).toLocaleDateString('uk-UA')}</td>
                                        <td className="archive-danger">{item.writeOffReason}</td>
                                        <td>
                                            {item.documentLink ? (
                                                <a href={item.documentLink} target="_blank" rel="noreferrer" className="archive-link">{item.actNumber}</a>
                                            ) : (
                                                <span className="archive-act">{item.actNumber}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            ) : (
                /* ─── Transferred Items Table ─── */
                <div className="archive-list">
                    {transfers.length === 0 ? (
                        <p className="archive-empty">Переданого майна не знайдено</p>
                    ) : (
                        <table className="archive-table">
                            <thead>
                                <tr>
                                    <th>Назва</th>                         
                                    <th>Звідки</th>
                                    <th>Куди</th>
                                    <th>Кількість</th>
                                    <th>Дата передачі</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transfers.map(log => (
                                    <tr key={log.id}>
                                        <td><strong>{log.itemName}</strong></td>    
                                        <td>{log.FromBrigade?.name || `ID: ${log.fromBrigadeId}`}</td>
                                        <td>{log.ToBrigade?.name || `ID: ${log.toBrigadeId}`}</td>
                                        <td>{log.quantity}</td>
                                        <td>{new Date(log.transferDate).toLocaleDateString('uk-UA')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default ArchivePage;
