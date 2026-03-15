import React, { useState, useEffect } from 'react'
import { GiHamburgerMenu } from 'react-icons/gi'
import '../scss/header.scss'
import logopict from '../img/DSNSlogo.svg'

const Header = ({ user, selectedBrigade, onBrigadeChange, onLogout, toggleSidebar }) => {
    const [detachments, setDetachments] = useState([])
    const showDropdown = user?.role === 'GOD' || user?.role === 'SEMI-GOD'

    useEffect(() => {
        if (!showDropdown) return

        const fetchDetachments = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await fetch('/api/detachments', {
                    headers: { Authorization: `Bearer ${token}` },
                })
                const data = await res.json()
                setDetachments(data)
            } catch (err) {
                console.error('Failed to fetch detachments:', err)
            }
        }
        fetchDetachments()
    }, [showDropdown])

    return (
        <>
            <header className='header-container'>
                <div>
                    <h2>
                        Наглядова справа
                    </h2>
                </div>
                <div className="header">
                    <div className="droplist">
                        <div className="hamburger-container-header">
                            <button className="hamburger-btn" onClick={toggleSidebar}>
                                <GiHamburgerMenu size={28} />
                            </button>
                        </div>
                        <div className='logopict'>
                            <img src={logopict} alt="logo" />
                        </div>
                        {showDropdown ? (
                            <select
                                value={selectedBrigade || ''}
                                onChange={(e) => onBrigadeChange(Number(e.target.value))}
                            >
                                <option value="">Оберіть бригаду</option>
                                {detachments.map((det) => (
                                    <optgroup key={det.id} label={det.name}>
                                        {det.Brigades?.map((brig) => (
                                            <option key={brig.id} value={brig.id}>
                                                {brig.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        ) : (
                            <span>{user?.brigadeName || 'Моя бригада'}</span>
                        )}
                        <div className='logotitle'>
                            <p>ГУ ДСНС України у Рівненській області</p>
                        </div>
                    </div>
                    <div className="header-right">

                        <div className="logout">
                            <button onClick={onLogout}>Вийти</button>
                        </div>
                    </div>
                </div>

            </header>

        </>
    )
}

export default Header
