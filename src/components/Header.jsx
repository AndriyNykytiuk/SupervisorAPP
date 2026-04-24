import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchDetachments, fetchBrigadeLastLogin } from '../api/services.js';
import useApi from '../hooks/useApi.js';
import { GiHamburgerMenu } from 'react-icons/gi';
import { IoLogOutOutline, IoCalendarOutline } from 'react-icons/io5';
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2';
import { useLocation, useNavigate } from 'react-router-dom';
import CreateEventModal from './CreateEventModal.jsx';
import '../scss/header.scss';
import logopict from '../img/DSNSlogo.svg';

const Header = ({ toggleSidebar }) => {
    const { user, selectedBrigade, setBrigade, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const isGenericDatasPage = location.pathname === '/genericDatas';
    const isGod = user?.role === 'GOD';
    const [showCreateEvent, setShowCreateEvent] = useState(false);
    const [showAvatarMenu, setShowAvatarMenu] = useState(false);
    const avatarMenuRef = useRef(null);

    useEffect(() => {
        if (!showAvatarMenu) return;
        const onDocClick = (e) => {
            if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target)) {
                setShowAvatarMenu(false);
            }
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [showAvatarMenu]);

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
                    <div
                        className='header__brand'
                        role='button'
                        tabIndex={0}
                        onClick={() => navigate('/')}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                navigate('/');
                            }
                        }}
                        title='На головну'
                    >
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
                                                <div className='header__date-info-text'>
                                                    <span>Оновлено: {new Date(lastLogin).toLocaleDateString('uk-UA')}</span>
                                                    <span>{rwUserName}</span>
                                                </div>

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

                        <div className={`header__user-info${isGod ? ' is-god' : ''}`} ref={avatarMenuRef}>
                            <div
                                className={`header__avatar${isGod ? ' is-god' : ''}`}
                                onClick={isGod ? () => setShowAvatarMenu((v) => !v) : undefined}
                                title={isGod ? 'Меню подій' : undefined}
                                role={isGod ? 'button' : undefined}
                            >
                                {user?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <span className='header__username'>{user?.name || 'User'}</span>
                            {isGod && showAvatarMenu && (
                                <div className='header__avatar-menu'>
                                    <button
                                        type='button'
                                        className='header__avatar-menu-item'
                                        onClick={() => {
                                            setShowAvatarMenu(false);
                                            setShowCreateEvent(true);
                                        }}
                                    >
                                        Створити подію
                                    </button>
                                    <button
                                        type='button'
                                        className='header__avatar-menu-item'
                                        onClick={() => {
                                            setShowAvatarMenu(false);
                                            navigate('/events');
                                        }}
                                    >
                                        Події
                                    </button>
                                </div>
                            )}
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

            {isGod && (
                <CreateEventModal
                    isOpen={showCreateEvent}
                    onClose={() => setShowCreateEvent(false)}
                    onCreated={() => navigate('/events')}
                />
            )}
        </header>
    )
}

export default Header
