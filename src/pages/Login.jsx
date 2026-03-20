import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { loginUser } from '../api/services.js';
import '../scss/login.scss';

const Login = () => {
    const { login } = useAuth();
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await loginUser(name, password);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            login(data.user);
        } catch (err) {
            setError(err?.response?.data?.error || 'Server connection error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit}>
                <h2>Наглядова справа</h2>
                {error && <p className="error">{error}</p>}
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
