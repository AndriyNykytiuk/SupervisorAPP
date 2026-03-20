import React from 'react';

const ErrorMessage = ({ message = 'Щось пішло не так', onRetry }) => {
    return (
        <div style={styles.container}>
            <p style={styles.text}>❌ {message}</p>
            {onRetry && (
                <button style={styles.button} onClick={onRetry}>
                    Спробувати ще
                </button>
            )}
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1.5rem',
        gap: '0.75rem',
        background: 'var(--fail-bg)',
        border: '1px solid var(--fail-border)',
        borderRadius: '8px',
        margin: '1rem',
    },
    text: {
        fontSize: '0.95rem',
        color: 'var(--danger-dark)',
        margin: 0,
    },
    button: {
        padding: '0.4rem 1rem',
        background: 'var(--navy)',
        color: 'var(--white)',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: 600,
    },
};

export default ErrorMessage;
