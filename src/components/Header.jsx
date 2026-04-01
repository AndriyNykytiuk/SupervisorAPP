import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchDetachments, fetchBrigadeLastLogin } from '../api/services.js';
import useApi from '../hooks/useApi.js';
import { GiHamburgerMenu } from 'react-icons/gi';
import { IoLogOutOutline, IoCalendarOutline } from 'react-icons/io5';
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2';
import { useLocation } from 'react-router-dom';
import '../scss/header.scss';
import logopict from '../img/DSNSlogo.svg';

const Header = ({ toggleSidebar }) => {
    const { user, selectedBrigade, setBrigade, logout } = useAuth();
    const location = useLocation();
    const isGenericDatasPage = location.pathname === '/genericDatas';

    const showDropdown = user?.role === 'GOD' || user?.role === 'SEMI-GOD';

    const { data: detachments } = useApi(
        () => fetchDetachments(),
        [showDropdown],
        { skip: !showDropdown }
    );

    // Fetch lastLogin and userName for the selected brigade (GOD/SEMI-GOD only)
    const [lastLogin, setLastLogin] = useState(null);
    const [rwUserName, setRwUserName] = useState(null);

    useEffect(() => {
        if (!showDropdown || !selectedBrigade) {
            setLastLogin(null);
            return;
        }

            fetchBrigadeLastLogin(selectedBrigade)
                .then((data) => {
                    setLastLogin(data.lastLogin);
                    setRwUserName(data.userName);
                })
                .catch(() => {
                    setLastLogin(null);
                    setRwUserName(null);
                });
        }, [selectedBrigade, showDropdown]);

    return (
        <header className='header'>
            {/* ─── Top Bar ─── */}
            <div className='header__top'>
                <div className='header__top-inner'>
                    <div className='header__brand'>
                   
                        <img className='header__logo' src={logopict} alt="ДСНС Logo" />
                        <div className='header__brand-text'>
                            <h1 className='header__title'>Наглядова справа</h1>
                            <p className='header__subtitle'>ГУ ДСНС України у Рівненській області</p>
                        </div>

                    </div>

                    <div className='header__actions'>
                        {!isGenericDatasPage && (
                            showDropdown ? (
                                <>
                                    <div className='header__selector'>
                                        <HiOutlineBuildingOffice2 className='header__selector-icon' />
                                        <select
                                            className='header__select'
                                            value={selectedBrigade || ''}
                                            onChange={(e) => setBrigade(Number(e.target.value))}
                                        >
                                            <option value="">Обрати частину</option>
                                            {(detachments || []).map((det) => (
                                                <optgroup key={det.id} label={det.name}>
                                                    {det.Brigades?.map((brig) => (
                                                        <option key={brig.id} value={brig.id}>
                                                            {brig.name}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>

                                    {lastLogin && (
                                        <div className='header__date-badge'>
                                            <div className="header__date-info">
                                                <IoCalendarOutline />
                                                <span>Оновлено: {new Date(lastLogin).toLocaleDateString('uk-UA')}</span>

                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className='header__brigade-badge'>
                                    <HiOutlineBuildingOffice2 />
                                    <span>{user?.brigadeName || 'Моя частина'}</span>
                                </div>
                            )
                        )}

                        <div className='header__user-info'>
                            <div className='header__avatar'>
                                {user?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <span className='header__username'>{user?.name || 'User'}</span>
                        </div>
                        <button className='header__hamburger' onClick={toggleSidebar} aria-label="Toggle sidebar">
                            <GiHamburgerMenu />
                        </button>
                        <button className='header__logout' onClick={logout} title="Вийти">
                            <IoLogOutOutline />
                            <span>Вийти</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ─── Accent Gradient Line ─── */}
            <div className='header__accent'></div>
        </header>
    )
}

export default Header
