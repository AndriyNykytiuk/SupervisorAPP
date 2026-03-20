import React from 'react';
import '../scss/genericdatas.scss';

const TotalElectricStations = ({ electricStations = [] }) => {

    const POWER_RANGES = [
        { key: '<10', label: 'до 10 кВт', match: p => p <= 10 },
        { key: '10-29', label: 'від 10 до 29 кВт', match: p => p > 10 && p < 30 },
        { key: '30-59', label: 'від 30 до 59 кВт', match: p => p >= 30 && p < 60 },
        { key: '60-99', label: 'від 60 до 99 кВт', match: p => p >= 60 && p < 100 },
        { key: '100-199', label: 'від 100 до 199 кВт', match: p => p >= 100 && p < 200 },
        { key: '200-399', label: 'від 200 до 399 кВт', match: p => p >= 200 && p < 400 },
        { key: '400-599', label: 'від 400 до 599 кВт', match: p => p >= 400 && p < 600 },
        { key: '600-999', label: 'від 600 до 999 кВт', match: p => p >= 600 && p < 1000 },
        { key: '>=1000', label: '1000 і більше кВт', match: p => p >= 1000 }
    ];

    const STATUSES = [
        'На автомобілях',
        'Готові до залучення',
        'Залучені',
        'Резервне живлення підрозділів',
        'Склад АРЗ СП',
        'На автомобілях зведеного загіну',
        'Склад зведеного загону',
        'Ремонт'
    ];

    // Helper to safely check status
    const getNormalizedStatus = (stationStatus) => {
        if (!stationStatus) return 'Інше';
        const normalized = stationStatus.trim().toLowerCase();
        
        // Find matching status ignoring case and minor typos
        const match = STATUSES.find(s => {
            const sNorm = s.toLowerCase();
            if (sNorm === normalized) return true;
            if (sNorm.includes('загіну') && normalized.includes('загону')) return true; // Typo fallback
            if (sNorm.includes('загону') && normalized.includes('загіну')) return true;
            return false;
        });

        return match || 'Інше';
    };

    // Calculate grid data
    const gridData = {};
    STATUSES.forEach(status => {
        gridData[status] = { total: 0 };
        POWER_RANGES.forEach(range => {
            gridData[status][range.key] = 0;
        });
    });
    // Add 'Інше' (Other) category just in case
    gridData['Інше'] = { total: 0 };
    POWER_RANGES.forEach(range => gridData['Інше'][range.key] = 0);

    // Totals across all statuses
    const grandTotals = { total: 0 };
    POWER_RANGES.forEach(range => grandTotals[range.key] = 0);

    electricStations.forEach(station => {
        const power = Number(station.powerOf) || 0;
        const status = getNormalizedStatus(station.placeOfStorage);
        
        const matchedRange = POWER_RANGES.find(r => r.match(power));
        
        if (matchedRange && gridData[status]) {
            gridData[status][matchedRange.key]++;
            gridData[status].total++;
            
            grandTotals[matchedRange.key]++;
            grandTotals.total++;
        }
    });

    // Cleanup 'Інше' if empty
    if (gridData['Інше'].total === 0) {
        delete gridData['Інше'];
    }

    const renderStatuses = Object.keys(gridData);

    return (
        <div className="gd-wrapper" style={{ overflowX: 'auto' }}>
            <div className="gd-header" style={{ padding: '0 0 0.5rem 0' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: 0 }}>Електростанції по потужності - {grandTotals.total} од.</h3>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', minWidth: '900px' }}>
                <thead>
                    <tr>
                        <th style={styles.th}>Електростанції</th>
                        <th style={styles.thCenter}>Всього</th>
                        {POWER_RANGES.map(r => (
                            <th key={r.key} style={styles.thCenter}>{r.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {/* First row is Grand Totals according to markdown */}
                   

                    {/* render rest of statuses */}
                    {renderStatuses.map(status => (
                        <tr key={status}>
                            <td style={styles.td}>{status}</td>
                            <td style={{ ...styles.tdCenter, fontWeight: '600' }}>{gridData[status].total || ''}</td>
                            {POWER_RANGES.map(r => (
                                <td key={r.key} style={{ ...styles.tdCenter, color: gridData[status][r.key] > 0 ? 'var(--gray-800)' : 'var(--gray-300)' }}>
                                    {gridData[status][r.key] || '0'}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const styles = {
    th: {
        borderBottom: '2px solid var(--navy)',
        padding: '0.75rem 0.5rem',
        textAlign: 'left',
        fontSize: '0.85rem',
        fontWeight: 'bold',
        color: 'var(--gray-700)',
    },
    thCenter: {
        borderBottom: '2px solid var(--navy)',
        padding: '0.75rem 0.5rem',
        textAlign: 'center',
        fontSize: '0.85rem',
        fontWeight: 'bold',
        color: 'var(--gray-700)',
    },
    td: {
        borderBottom: '1px solid var(--gray-200)',
        padding: '0.75rem 0.5rem',
        fontSize: '0.9rem',
        color: 'var(--gray-800)',
    },
    tdCenter: {
        borderBottom: '1px solid var(--gray-200)',
        padding: '0.75rem 0.5rem',
        textAlign: 'center',
        fontSize: '0.9rem',
    }
}

export default TotalElectricStations;