import React from 'react';
import '../scss/genericdatas.scss';

const TotalHydrauliktools = ({ tools = [] }) => {
    
    // According to MD:
    // Привід акумуляторний 83
    // Привід механічний 26
    // Привід ручний 19
    // Привід електричний 14

    const DRIVE_TYPES = [
        { key: 'акумуляторний', label: 'Привід акумуляторний' },
        { key: 'механічний', label: 'Привід механічний' },
        { key: 'ручний', label: 'Привід ручний' },
        { key: 'електричний', label: 'Привід електричний' }
    ];

    // Calculate totals
    const gridData = {};
    DRIVE_TYPES.forEach(type => {
        gridData[type.key] = 0;
    });
    gridData['інший'] = 0;

    let grandTotal = 0;

    tools.forEach(tool => {
        const drive = (tool.typeOfStern || '').toLowerCase();
        
        const matchedType = DRIVE_TYPES.find(d => drive.includes(d.key));
        if (matchedType) {
            gridData[matchedType.key]++;
        } else {
            gridData['інший']++;
        }
        grandTotal++;
    });

    if (gridData['інший'] === 0) {
        delete gridData['інший'];
    }

    return (
        <div className="gd-wrapper" style={{ overflowX: 'auto', maxWidth: '600px' }}>
            <div className="gd-header" style={{ padding: '0 0 0.5rem 0' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: 0 }}>Гідравліка - {grandTotal} од.</h3>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                <thead>
                    <tr>
                        <th style={styles.th}>Тип приводу</th>
                        <th style={styles.thCenter}>Всього</th>
                    </tr>
                </thead>
                <tbody>
                    {DRIVE_TYPES.map(type => (
                        <tr key={type.key}>
                            <td style={styles.td}>{type.label}</td>
                            <td style={{ ...styles.tdCenter, fontWeight: '600' }}>
                                {gridData[type.key]}
                            </td>
                        </tr>
                    ))}
                    {gridData['інший'] !== undefined && (
                        <tr>
                            <td style={styles.td}>Інший привід</td>
                            <td style={{ ...styles.tdCenter, fontWeight: '600' }}>
                                {gridData['інший']}
                            </td>
                        </tr>
                    )}
                    <tr>
                        <td style={{ ...styles.td, fontWeight: 'bold' }}>Всього</td>
                        <td style={{ ...styles.tdCenter, fontWeight: 'bold', color: 'var(--navy)' }}>
                            {grandTotal}
                        </td>
                    </tr>
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

export default TotalHydrauliktools;