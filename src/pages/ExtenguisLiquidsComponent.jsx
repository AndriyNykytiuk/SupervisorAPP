
import React, { useState, useEffect } from 'react';
import FoamComponent from '../components/FoamComponent';
import PowderComponent from '../components/PowderComponent';
import StorageComponent from '../components/StorageComponent';
import UsedExtenguishLiquids from '../components/UsedExtenguisLiquids';
import '../scss/extenguisliquids.scss'

const ExtenguisLiquidsComponent = ({ selectedBrigade }) => {
    const [foamAgentId, setFoamAgentId] = useState(null);
    const [foamData, setFoamData] = useState(null);
    const [powderId, setPowderId] = useState(null);
    const [powderData, setPowderData] = useState(null);

    // ── FoamAgent fetch / save ─────────────────
    const fetchFoamAgent = async () => {
        if (!selectedBrigade) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/foam-agents/brigade/${selectedBrigade}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const items = await res.json();
                if (items.length > 0) {
                    setFoamAgentId(items[0].id);
                    setFoamData(items[0]);
                } else {
                    setFoamAgentId(null);
                    setFoamData(null);
                }
            }
        } catch (err) {
            console.error('Failed to fetch FoamAgent:', err);
        }
    };

    const saveFoamAgent = async (payload) => {
        const token = localStorage.getItem('token');
        if (foamAgentId) {
            const res = await fetch(`/api/foam-agents/${foamAgentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            if (res.ok) { await fetchFoamAgent(); return true; }
            return false;
        } else {
            const res = await fetch('/api/foam-agents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ ...payload, brigadeId: selectedBrigade }),
            });
            if (res.ok) { await fetchFoamAgent(); return true; }
            return false;
        }
    };

    // ── Powder fetch / save ────────────────────
    const fetchPowder = async () => {
        if (!selectedBrigade) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/powder/brigade/${selectedBrigade}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const items = await res.json();
                if (items.length > 0) {
                    setPowderId(items[0].id);
                    setPowderData(items[0]);
                } else {
                    setPowderId(null);
                    setPowderData(null);
                }
            }
        } catch (err) {
            console.error('Failed to fetch Powder:', err);
        }
    };

    const savePowder = async (payload) => {
        const token = localStorage.getItem('token');
        if (powderId) {
            const res = await fetch(`/api/powder/${powderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            if (res.ok) { await fetchPowder(); return true; }
            return false;
        } else {
            const res = await fetch('/api/powder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ ...payload, brigadeId: selectedBrigade }),
            });
            if (res.ok) { await fetchPowder(); return true; }
            return false;
        }
    };

    // ── Один useEffect для обох fetch ──────────
    useEffect(() => {
        fetchFoamAgent();
        fetchPowder();
    }, [selectedBrigade]);

    return (
        <div>
            <div className='liquids-container'>
                <FoamComponent foamData={foamData} onSave={saveFoamAgent} />
                <PowderComponent powderData={powderData} onSave={savePowder} />
            </div>
            <StorageComponent foamData={foamData} onSave={saveFoamAgent} selectedBrigade={selectedBrigade} />
            <UsedExtenguishLiquids selectedBrigade={selectedBrigade} />
        </div>
    );
};

export default ExtenguisLiquidsComponent;

