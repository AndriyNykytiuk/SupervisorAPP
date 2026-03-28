import React from 'react';
import { NavLink } from 'react-router-dom';
import { MdClose } from 'react-icons/md';
import { IoLogOutOutline } from 'react-icons/io5';
import { useAuth } from '../context/AuthContext.jsx';
import '../scss/sidebar.scss'

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { user, logout } = useAuth();

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="mobile-sidebar-header">
                <h2>Меню</h2>
                <button className="close-sidebar-btn" onClick={toggleSidebar}>
                    <MdClose size={24} />
                </button>
            </div>

            <div className='sidebar-links'>
                {user?.role === 'GOD' && (
                    <NavLink to='/' onClick={() => isOpen && toggleSidebar()}>Оновлення даних</NavLink>
                )}
                <NavLink to='/nextTestes' onClick={() => isOpen && toggleSidebar()}>Найближчі випробування</NavLink>
                <NavLink to="/tests" onClick={() => isOpen && toggleSidebar()}>Випробування</NavLink>
                <NavLink to="/tools" onClick={() => isOpen && toggleSidebar()}>Відомості ПТО та АРО</NavLink>
                <NavLink to="/extenguisLiquids" onClick={() => isOpen && toggleSidebar()}>Вогонегасні речовини</NavLink>
                <NavLink to="/transfer" onClick={() => isOpen && toggleSidebar()}>Передача майна</NavLink>
                {user?.role !== 'RW' && (
                    <NavLink to="/genericDatas" onClick={() => isOpen && toggleSidebar()}>Загальні дані</NavLink>
                )}
                <NavLink to="/literature" onClick={() => isOpen && toggleSidebar()}>CFBT.UA</NavLink>
                <NavLink to="/archives" onClick={() => isOpen && toggleSidebar()}>Списане майно</NavLink>
            </div>

            <button className="sidebar-logout" onClick={logout} title="Вийти">
                <IoLogOutOutline />
                <span>Вийти</span>
            </button>
        </div>
    );
};

export default Sidebar;
