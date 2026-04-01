import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';
import { formatDistanceToNow, isValid } from 'date-fns';
import { uk } from 'date-fns/locale';
import LoginActivityChart from '../components/LoginActivityChart.jsx';
import '../scss/home.scss';

const Home = () => {
    const { user } = useAuth();
    const [brigadesData, setBrigadesData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.role !== 'RW') {
            const fetchBrigadesActivity = async () => {
                try {
                    const res = await api.get('/auth/all-brigades-activity');
                    setBrigadesData(res.data);
                } catch (error) {
                    console.error('Failed to fetch brigades activity:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchBrigadesActivity();
        } else {
            setLoading(false);
        }
    }, [user]);

    // For RW users, we just show a placeholder for now - or we can fetch their upcoming tests
    if (user?.role === 'RW') {
        return (
            <div className="home-container rw-home">
                <div className="home-header">
                    <h2>Огляд діяльності: {user.brigadeName}</h2>
                    <p>Вітаємо в системі! Оберіть потрібний розділ у боковому меню.</p>
                </div>
                
                <div className="rw-widgets">
                    <div className="widget info-widget">
                        <h3>Швидкі посилання</h3>
                        <ul>
                            <li><a href="/nextTestes">Найближчі випробування</a></li>
                            <li><a href="/tools">Відомості ПТО та АРО</a></li>
                            <li><a href="/extenguisLiquids">Вогонегасні речовини</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    // GOD / SEMI-GOD view
    const getStatusInfo = (lastLogin) => {
        if (!lastLogin) return { status: 'danger', text: 'Ніколи не було входу' };
        
        const d = new Date(lastLogin);
        if (!isValid(d)) return { status: 'danger', text: 'Ніколи не було входу' };
        
        const daysAgo = Math.floor((new Date() - d) / (1000 * 60 * 60 * 24));
        
        if (daysAgo <= 7) return { status: 'success', text: 'Активно (останні 7 днів)' };
        if (daysAgo <= 30) return { status: 'warning', text: 'Потребує уваги (більше тижня)' };
        return { status: 'danger', text: `Давно не оновлювалось (${daysAgo} днів тому)` };
    };

    return (
        <div className="home-container">
            <div className="home-header">
                <h2>Панель активності підрозділів</h2>
                <p>Зведена інформація про останні оновлення в кожній частині.</p>
            </div>

            {loading ? (
                <div className="loading-spinner">Завантаження даних...</div>
            ) : (
                <>
                <LoginActivityChart brigadesData={brigadesData} />
                <div className="activity-table-wrapper">
                    <table className="activity-table">
                        <thead>
                            <tr>
                                <th>Загін</th>
                                <th>Підрозділ</th>
                                <th>Відповідальна особа</th>
                                <th>Остання активність</th>
                                <th>Статус оновлення</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(brigadesData) && brigadesData.map(brigade => {
                                const statusInfo = getStatusInfo(brigade.lastLogin);
                                const d = brigade.lastLogin ? new Date(brigade.lastLogin) : null;
                                const isDateValid = d && isValid(d);

                                return (
                                    <tr key={brigade.id}>
                                        <td>{brigade.detachmentName || '-'}</td>
                                        <td className="fw-bold">{brigade.name}</td>
                                        <td>
                                            {brigade.rwUserName ? (
                                                <span className="user-badge">{brigade.rwUserName}</span>
                                            ) : (
                                                <span className="text-muted">Не призначено</span>
                                            )}
                                        </td>
                                        <td>
                                            {isDateValid ? (
                                                <div className="login-time">
                                                    <span>{d.toLocaleDateString('uk-UA')}</span>
                                                    <span className="time-ago"> ({formatDistanceToNow(d, { addSuffix: true, locale: uk })})</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`status-pill status-${statusInfo.status}`}>
                                                {statusInfo.text}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                </>
            )}
        </div>
    );
};

export default Home;
