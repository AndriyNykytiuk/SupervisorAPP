import React from 'react';
import { NavLink } from 'react-router-dom';
import { MdClose } from 'react-icons/md';
import { useAuth } from '../context/AuthContext.jsx';
import '../scss/sidebar.scss'

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { user } = useAuth();

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="mobile-sidebar-header">
                <h2>Меню</h2>
                <button className="close-sidebar-btn" onClick={toggleSidebar}>
                    <MdClose size={24} />
                </button>
            </div>

            <div className='sidebar-links'>
                <NavLink to='/nextTestes' onClick={toggleSidebar}>Найближчі випробування</NavLink>
                <NavLink to="/tests" onClick={toggleSidebar}>Випробування</NavLink>
                <NavLink to="/tools" onClick={toggleSidebar}>Відомості ПТО та АРО</NavLink>
                <NavLink to="/extenguisLiquids" onClick={toggleSidebar}>Вогонегасні речовини</NavLink>
                <NavLink to="/transfer" onClick={toggleSidebar}>Передача майна</NavLink>
                {user?.role !== 'RW' && (
                    <NavLink to="/genericDatas" onClick={toggleSidebar}>Загальні дані</NavLink>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
