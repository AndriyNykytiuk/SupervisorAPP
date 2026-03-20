import React, { useState, useEffect } from 'react';
import {
    fetchFoamAgentByBrigade, createFoamAgent, updateFoamAgent,
    fetchPowderByBrigade, createPowder, updatePowder
} from '../api/services.js';
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
    const fetchFoamAgentData = async () => {
        if (!selectedBrigade) return;
        try {
            const items = await fetchFoamAgentByBrigade(selectedBrigade);
            if (items.length > 0) {
                setFoamAgentId(items[0].id);
                setFoamData(items[0]);
            } else {
                setFoamAgentId(null);
                setFoamData(null);
            }
        } catch (err) {
            console.error('Failed to fetch FoamAgent:', err);
        }
    };

    const saveFoamAgentData = async (payload) => {
        try {
            if (foamAgentId) {
                await updateFoamAgent(foamAgentId, payload);
                await fetchFoamAgentData();
                return true;
            } else {
                await createFoamAgent({ ...payload, brigadeId: selectedBrigade });
                await fetchFoamAgentData();
                return true;
            }
        } catch (err) {
            console.error('Failed to save FoamAgent:', err);
            return false;
        }
    };

    // ── Powder fetch / save ────────────────────
    const fetchPowderData = async () => {
        if (!selectedBrigade) return;
        try {
            const items = await fetchPowderByBrigade(selectedBrigade);
            if (items.length > 0) {
                setPowderId(items[0].id);
                setPowderData(items[0]);
            } else {
                setPowderId(null);
                setPowderData(null);
            }
        } catch (err) {
            console.error('Failed to fetch Powder:', err);
        }
    };

    const savePowderData = async (payload) => {
        try {
            if (powderId) {
                await updatePowder(powderId, payload);
                await fetchPowderData();
                return true;
            } else {
                await createPowder({ ...payload, brigadeId: selectedBrigade });
                await fetchPowderData();
                return true;
            }
        } catch (err) {
            console.error('Failed to save Powder:', err);
            return false;
        }
    };

    // ── Один useEffect для обох fetch ──────────
    useEffect(() => {
        fetchFoamAgentData();
        fetchPowderData();
    }, [selectedBrigade]);

    return (
        <div>
            <div className='liquids-container'>
                <FoamComponent foamData={foamData} onSave={saveFoamAgentData} />
                <PowderComponent powderData={powderData} onSave={savePowderData} />
            </div>
            <StorageComponent foamData={foamData} onSave={saveFoamAgentData} selectedBrigade={selectedBrigade} />
            <UsedExtenguishLiquids selectedBrigade={selectedBrigade} />
        </div>
    );
};

export default ExtenguisLiquidsComponent;
