import React from 'react';
import { Outlet } from 'react-router-dom';
import '../scss/mainboard.scss'

const Mainbar = () => {
    return (
        <div className="mainbar">
            <Outlet />
        </div>
    );
};

export default Mainbar;
