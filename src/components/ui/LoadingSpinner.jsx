import React from 'react';

const LoadingSpinner = ({ message = 'Завантаження...' }) => {
    return (
        <div style={styles.container}>
            <div style={styles.spinner}></div>
            <p style={styles.message}>{message}</p>
            <style>{keyframes}</style>
        </div>
    );
};

const keyframes = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
`;

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        gap: '1rem',
    },
    spinner: {
        width: '36px',
        height: '36px',
        border: '4px solid var(--gray-200)',
        borderTop: '4px solid var(--navy)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    message: {
        fontSize: '0.9rem',
        color: 'var(--gray-500)',
    },
};

export default LoadingSpinner;
