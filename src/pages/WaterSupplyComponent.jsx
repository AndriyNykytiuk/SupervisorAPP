import React, { useState, useEffect, useCallback } from 'react'
import {
    fetchFireHydrantsByBrigade,
    fetchFireHosesByBrigade,
} from '../api/services.js'
import ItemFireHydrant from '../components/ItemFireHydrant.jsx'
import ItemFireHose from '../components/ItemFireHose.jsx'
import '../scss/watersupply.scss'

const WaterSupplyComponent = ({ selectedBrigade }) => {
    const [activeTab, setActiveTab] = useState('hydrants')
    const [hydrants, setHydrants] = useState([])
    const [hoses, setHoses] = useState([])

    const fetchHydrants = useCallback(async () => {
        if (!selectedBrigade) return
        try {
            const data = await fetchFireHydrantsByBrigade(selectedBrigade)
            setHydrants(data)
        } catch (err) {
            console.error('Failed to fetch FireHydrants:', err)
        }
    }, [selectedBrigade])

    const fetchHoses = useCallback(async () => {
        if (!selectedBrigade) return
        try {
            const data = await fetchFireHosesByBrigade(selectedBrigade)
            setHoses(data)
        } catch (err) {
            console.error('Failed to fetch FireHoses:', err)
        }
    }, [selectedBrigade])

    useEffect(() => {
        fetchHydrants()
        fetchHoses()
    }, [fetchHydrants, fetchHoses])

    // Poll for hydrant inspection updates so desktop view reflects mobile scans without manual refresh.
    useEffect(() => {
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                fetchHydrants()
            }
        }, 15000)
        const onFocus = () => fetchHydrants()
        window.addEventListener('focus', onFocus)
        return () => {
            clearInterval(interval)
            window.removeEventListener('focus', onFocus)
        }
    }, [fetchHydrants])

    return (
        <div className='water-supply-page'>
            <div className='water-supply-tabs'>
                <button
                    className={`ws-tab-btn ${activeTab === 'hydrants' ? 'active' : ''}`}
                    onClick={() => setActiveTab('hydrants')}
                >
                    Пожежні гідранти ({hydrants.length})
                </button>
                <button
                    className={`ws-tab-btn ${activeTab === 'hoses' ? 'active' : ''}`}
                    onClick={() => setActiveTab('hoses')}
                >
                    Пожежні рукави ({hoses.length})
                </button>
            </div>

            {activeTab === 'hydrants' && (
                <ItemFireHydrant
                    items={hydrants}
                    selectedBrigade={selectedBrigade}
                    onChanged={fetchHydrants}
                />
            )}
            {activeTab === 'hoses' && (
                <ItemFireHose
                    items={hoses}
                    selectedBrigade={selectedBrigade}
                    onChanged={fetchHoses}
                />
            )}
        </div>
    )
}

export default WaterSupplyComponent
