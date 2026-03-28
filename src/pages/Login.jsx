import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { loginUser } from '../api/services.js';
import '../scss/login.scss';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [attemptsLeft, setAttemptsLeft] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await loginUser(name, password);
            const data = response.data;
            
            if (response.headers && response.headers['ratelimit-remaining'] !== undefined) {
                setAttemptsLeft(parseInt(response.headers['ratelimit-remaining'], 10));
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            login(data.user);
            navigate('/');
        } catch (err) {
            if (err.response?.headers && err.response.headers['ratelimit-remaining'] !== undefined) {
                setAttemptsLeft(parseInt(err.response.headers['ratelimit-remaining'], 10));
            }
            setError(err?.response?.data?.error || 'Помилка підключення до сервера');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit}>
                <h2>Наглядова справа</h2>
                {error && <p className="error">{error}</p>}
                {attemptsLeft !== null && attemptsLeft < 5 && (
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
                        Залишилось спроб: {attemptsLeft}
                    </p>
                )}
                <input
                    type="text"
                    placeholder="Логін"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Вхід...' : 'Вхід'}
                </button>
            </form>
        </div>
    );
};

export default Login;
