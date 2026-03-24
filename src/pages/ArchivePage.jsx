import React, { useEffect, useState } from 'react';
import { fetchArchivedEquipment } from '../api/services.js';
import '../scss/archivepage.scss';

const ArchivePage = () => {
    const [archives, setArchives] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadArchives = async () => {
            try {
                const data = await fetchArchivedEquipment();
                setArchives(data);
            } catch (error) {
                console.error('Failed to load archives:', error);
            } finally {
                setLoading(false);
            }
        };
        loadArchives();
    }, []);

    if (loading) return <div className="archive-loading" style={{ padding: '2rem', textAlign: 'center' }}>Завантаження архіву...</div>;

    return (
        <div className="archive-page" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 className="gd-title-wrapp">Архів списаного майна</h2>
            
            <div className="archive-list" style={{ overflowX: 'auto' }}>
                {archives.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--gray-600)', padding: '2rem' }}>Архів порожній</p>
                ) : (
                    <table className="archive-table" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <thead style={{ backgroundColor: 'var(--navy)', color: 'white' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Назва</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Інв. номер</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Частина</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Дата списання</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Причина</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Акт</th>
                            </tr>
                        </thead>
                        <tbody>
                            {archives.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                                    <td style={{ padding: '1rem' }}><strong>{item.name}</strong></td>
                                    <td style={{ padding: '1rem' }}>{item.inventoryNumber || '—'}</td>
                                    <td style={{ padding: '1rem' }}>{item.Brigade?.name || `ID: ${item.brigadeId}`}</td>
                                    <td style={{ padding: '1rem' }}>{new Date(item.writeOffDate).toLocaleDateString('uk-UA')}</td>
                                    <td style={{ padding: '1rem', color: '#ef4444' }}>{item.writeOffReason}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        {item.documentLink ? (
                                            <a href={item.documentLink} target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', textDecoration: 'underline', fontWeight: 'bold' }}>{item.actNumber}</a>
                                        ) : (
                                            <span style={{ fontWeight: 'bold' }}>{item.actNumber}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ArchivePage;
