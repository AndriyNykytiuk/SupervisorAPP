import React from 'react';
import '../scss/genericdatas.scss';

const TotalWaterPump = ({ waterPumps = [] }) => {

    const POWER_RANGES = [
        { key: '<=30', label: 'до 30 м3/год включно', match: p => p <= 30 },
        { key: '31-60', label: 'від 31 до 60 м3/год', match: p => p > 30 && p <= 60 },
        { key: '61-100', label: 'від 61 до 100 м3/год', match: p => p > 60 && p <= 100 },
        { key: '>100', label: 'більше 101 м3/год', match: p => p > 100 }
    ];

    const STATUSES = [
        'На техніці',
        'Склад',
        'На автомобілях зведеного загону',
        'Склад зведеного загону',
        'Мат. Резерв',
        'Ремонт'
    ];

    // Helper to safely check status
    const getNormalizedStatus = (stationStatus) => {
        if (!stationStatus) return 'Інше';
        const normalized = stationStatus.trim().toLowerCase();
        
        // Find matching status ignoring case
        const match = STATUSES.find(s => {
            const sNorm = s.toLowerCase();
            if (sNorm === normalized) return true;
            // Minor fallback for variations like "На автомобілях" instead of "На техніці" if any
            if (sNorm === 'на техніці' && normalized.includes('автомобілях') && !normalized.includes('зведен')) return true;
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

    waterPumps.forEach(pump => {
        const power = Number(pump.powerOf) || 0;
        const status = getNormalizedStatus(pump.placeOfStorage);
        
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
                <h3 style={{ fontSize: '1.25rem', marginBottom: 0 }}>Мотопомпи - {grandTotals.total} од.</h3>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', minWidth: '900px' }}>
                <thead>
                    <tr>
                        <th style={styles.th}>Мотопомпи</th>
                        <th style={styles.thCenter}>Всього</th>
                        {POWER_RANGES.map(r => (
                            <th key={r.key} style={styles.thCenter}>{r.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {/* First row is Grand Totals */}


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

export default TotalWaterPump;
