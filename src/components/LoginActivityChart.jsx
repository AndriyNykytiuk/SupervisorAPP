import React, { useMemo, useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../api/axios.js';
import '../scss/loginactivitychart.scss';

const COLORS_ACTIVE = '#2a9d8f';
const COLORS_INACTIVE = '#e63946';

const LoginActivityChart = ({ brigadesData: brigadesDataProp }) => {
    const [fetchedData, setFetchedData] = useState(null);

    // If no prop provided, fetch data ourselves
    useEffect(() => {
        if (!brigadesDataProp) {
            api.get('/auth/all-brigades-activity')
                .then(res => setFetchedData(res.data))
                .catch(err => console.error('LoginActivityChart: fetch error', err));
        }
    }, [brigadesDataProp]);

    const brigadesData = brigadesDataProp || fetchedData;
    const today = useMemo(() => {
        const d = new Date();
        return d.toISOString().slice(0, 10); // YYYY-MM-DD
    }, []);

    const { loggedIn, notLoggedIn, notLoggedInList } = useMemo(() => {
        if (!Array.isArray(brigadesData) || brigadesData.length === 0) {
            return { loggedIn: 0, notLoggedIn: 0, notLoggedInList: [] };
        }

        let logged = 0;
        let notLogged = 0;
        const missing = [];

        brigadesData.forEach(b => {
            if (b.lastLogin) {
                const loginDate = new Date(b.lastLogin).toISOString().slice(0, 10);
                if (loginDate === today) {
                    logged++;
                } else {
                    notLogged++;
                    missing.push(b);
                }
            } else {
                notLogged++;
                missing.push(b);
            }
        });

        return { loggedIn: logged, notLoggedIn: notLogged, notLoggedInList: missing };
    }, [brigadesData, today]);

    const total = loggedIn + notLoggedIn;
    if (total === 0) return null;

    const percentLogged = ((loggedIn / total) * 100).toFixed(1);
    const percentNotLogged = ((notLoggedIn / total) * 100).toFixed(1);

    const pieData = [
        { name: 'Оновили дані', value: loggedIn },
        { name: 'Не оновили', value: notLoggedIn },
    ];

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent === 0) return null;
        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={600}>
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="login-activity-section">
            <h3 className="login-activity-title">Оновлення даних станом на {new Date().toLocaleDateString('uk-UA')}</h3>
            <div className="login-activity-grid">
                <div className="chart-card">
                    <div className="chart-stats">
                        <div className="stat-item stat-active">
                            <span className="stat-number">{loggedIn}</span>
                            <span className="stat-label">Оновили ({percentLogged}%)</span>
                        </div>
                        <div className="stat-item stat-inactive">
                            <span className="stat-number">{notLoggedIn}</span>
                            <span className="stat-label">Не оновили ({percentNotLogged}%)</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                outerRadius={70}
                                innerRadius={25}
                                dataKey="value"
                                labelLine={false}
                                label={renderCustomLabel}
                                strokeWidth={2}
                                stroke="#fff"
                            >
                                <Cell fill={COLORS_ACTIVE} />
                                <Cell fill={COLORS_INACTIVE} />
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} підрозділів`]} />
                           
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Missing brigades table */}
                <div className="missing-card">
                    <h4>Підрозділи, що не оновили дані сьогодні <span className="badge-count">{notLoggedIn}</span></h4>
                    {notLoggedInList.length > 0 ? (
                        <div className="missing-table-scroll">
                            <table className="missing-table">
                                <thead>
                                    <tr>
                                        <th>Загін</th>
                                        <th>Підрозділ</th>
                                        <th>Остання активність</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {notLoggedInList.map(b => (
                                        <tr key={b.id}>
                                            <td>{b.detachmentName || '—'}</td>
                                            <td className="fw-bold">{b.name}</td>
                                            <td className="text-muted">
                                                {b.lastLogin
                                                    ? new Date(b.lastLogin).toLocaleDateString('uk-UA')
                                                    : 'Ніколи'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="all-updated">✅ Всі підрозділи оновили дані сьогодні!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginActivityChart;
