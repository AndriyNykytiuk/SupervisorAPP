import React, { useState, useEffect } from 'react'
import {
    fetchToolItemsByBrigade,
    searchAllTools,
    fetchTransferBrigades,
    fetchChainSawsByBrigade,
    createChainSaw,
    updateChainSaw,
    fetchPneumaticToolsByBrigade,
    createPneumaticTool,
    updatePneumaticTool,
    fetchPetrolCuttersByBrigade,
    createPetrolCutter,
    updatePetrolCutter,
} from '../api/services.js';
import { useAuth } from '../context/AuthContext.jsx';
import useApi from '../hooks/useApi.js';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import ErrorMessage from '../components/ui/ErrorMessage.jsx';
import ItemTool from '../components/ItemTool.jsx'
import ItemElectricTool from '../components/ItemElectricTool.jsx'
import ItemWaterPump from '../components/ItemWaterPump.jsx'
import ItemHydravlicTool from '../components/ItemHydravlicTool.jsx'
import ItemSwimTool from '../components/ItemSwimTool.jsx'
import BackPackExtenguisher from '../components/backPackExtenguisher.jsx'
import ItemSpecialTool from '../components/ItemSpecialTool.jsx'
import ItemSimpleTool from '../components/ItemSimpleTool.jsx'
import ItemLightMast from '../components/ItemLightMast.jsx'
import '../scss/toolscomponent.scss'
import SearchBar from '../components/ui/SearchBar.jsx'

const Toolscomponent = ({ selectedBrigade }) => {
    const {
        data: toolLists,
        loading,
        error,
        refetch
    } = useApi(
        () => fetchToolItemsByBrigade(selectedBrigade),
        [selectedBrigade],
        { skip: !selectedBrigade }
    );

    const [searchQuery, setSearchQuery] = useState('')

    // ── GOD Role "Find Especial Tool" Search ──
    const { user, setBrigade } = useAuth();
    const [showGodSearchModal, setShowGodSearchModal] = useState(false);
    const [godSearchQuery, setGodSearchQuery] = useState('');
    const [godSearchResults, setGodSearchResults] = useState([]);
    const [isGodSearching, setIsGodSearching] = useState(false);
    const [hasGodSearched, setHasGodSearched] = useState(false);

    const [transferBrigades, setTransferBrigades] = useState([]);
    useEffect(() => {
        if (user?.role === 'GOD') {
            fetchTransferBrigades().then(data => setTransferBrigades(data)).catch(console.error);
        }
    }, [user?.role]);

    const handleGodSearchSubmit = async (e) => {
        e.preventDefault();
        if (!godSearchQuery.trim()) return;
        setIsGodSearching(true);
        setHasGodSearched(true);
        try {
            const results = await searchAllTools(godSearchQuery);
            setGodSearchResults(results);
        } catch (err) {
            console.error(err);
        } finally {
            setIsGodSearching(false);
        }
    };

    const handleGoToTool = (tool) => {
        setBrigade(tool.brigadeId);
        setSearchQuery(tool.name); // Automatically pre-fill the search bar to highlight the component
        setShowGodSearchModal(false);
    };

    if (!selectedBrigade) {
        return <p>Оберіть частину бо так і будемо дивитися один на одного</p>
    }

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} onRetry={refetch} />;


    return (
        <div  className='toolscomponent-container'>
            <div className='toolscomponent-header' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Відомості ПТО та АРО</h2>
           
            </div>

            {/* GOD Search Modal */}
            {showGodSearchModal && (
                <div className='modal-overlay' onClick={() => setShowGodSearchModal(false)} style={{ zIndex: 1000, padding: '1rem' }}>
                    <div className='modal-content' onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '700px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
                        <div className="modal-header">
                            <h3>Пошук обладнання в гарнізоні</h3>
                            <button className="close-btn" onClick={() => setShowGodSearchModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleGodSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '1.5rem', padding: '1rem' }}>
                            <input 
                                type="text" 
                                value={godSearchQuery}
                                onChange={(e) => setGodSearchQuery(e.target.value)}
                                placeholder="Назва обладнання..." 
                                style={{ flex: 1, padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                            <button type="submit" disabled={isGodSearching} style={{ padding: '0.8rem 1.5rem', backgroundColor: 'var(--blue)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                {isGodSearching ? 'Пошук...' : 'Знайти'}
                            </button>
                        </form>
                        
                        <div style={{ overflowY: 'auto', padding: '0 1rem 1rem' }}>
                            {hasGodSearched && godSearchResults.length === 0 && !isGodSearching && (
                                <p style={{ textAlign: 'center', color: '#666', fontWeight: 'bold' }}>Такого в гарнізоні немає</p>
                            )}
                            {godSearchResults.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {godSearchResults.map(tool => (
                                        <div key={tool.id} style={{
                                            backgroundColor: '#fff',
                                            borderRadius: '8px',
                                            padding: '1rem',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                            border: '1px solid #e2e8f0',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.8rem'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                                                <div style={{ flex: '1 1 200px' }}>
                                                    <h4 style={{ margin: '0 0 0.4rem 0', color: 'var(--navy)', fontSize: '1.1rem', wordBreak: 'break-word' }}>
                                                        {tool.name}
                                                    </h4>
                                                    <p style={{ margin: '0 0 0.2rem', fontSize: '0.9rem', color: '#4a5568' }}>
                                                        <strong>Потужність/Характеристика:</strong> {tool.characteristic || '—'}
                                                    </p>
                                                    <p style={{ margin: '0', fontSize: '0.9rem', color: '#4a5568' }}>
                                                        <strong>Підрозділ:</strong> {tool.brigadeName}
                                                    </p>
                                                </div>
                                                <button 
                                                    onClick={() => handleGoToTool(tool)}
                                                    style={{ 
                                                        backgroundColor: 'var(--navy)', 
                                                        color: 'white', 
                                                        border: 'none', 
                                                        padding: '0.6rem 1rem', 
                                                        borderRadius: '4px', 
                                                        cursor: 'pointer', 
                                                        fontWeight: 'bold',
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    Перейти
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="search-bar-container">
            <SearchBar 
            className="search-bar"
            value={searchQuery} 
            onChange={setSearchQuery} 
            placeholder="Пошук за назвою обладнання..." />
                 {user?.role === 'GOD' && (
                    <button 
                    className="find-tool-button"
                        onClick={() => setShowGodSearchModal(true)}
                    >
                        Швидкий пошук по гарнізону
                    </button>
                )}
                </div>
            <ItemElectricTool selectedBrigade={selectedBrigade} searchQuery={searchQuery} transferBrigades={transferBrigades} />
            <ItemWaterPump selectedBrigade={selectedBrigade} searchQuery={searchQuery} transferBrigades={transferBrigades} />
            <ItemHydravlicTool selectedBrigade={selectedBrigade} searchQuery={searchQuery} transferBrigades={transferBrigades} />
            <ItemSwimTool selectedBrigade={selectedBrigade} searchQuery={searchQuery} transferBrigades={transferBrigades} />
            <BackPackExtenguisher selectedBrigade={selectedBrigade} searchQuery={searchQuery} transferBrigades={transferBrigades} />
            <ItemSpecialTool selectedBrigade={selectedBrigade} searchQuery={searchQuery} transferBrigades={transferBrigades} />
            <ItemSimpleTool
                selectedBrigade={selectedBrigade}
                searchQuery={searchQuery}
                title='Бензопили'
                equipmentType='ChainSaw'
                fetchFn={fetchChainSawsByBrigade}
                createFn={createChainSaw}
                updateFn={updateChainSaw}
                transferBrigades={transferBrigades}
                transferKey='chainSawIds'
            />
            <ItemSimpleTool
                selectedBrigade={selectedBrigade}
                searchQuery={searchQuery}
                title='Пневматичний інструмент'
                equipmentType='PneumaticTool'
                fetchFn={fetchPneumaticToolsByBrigade}
                createFn={createPneumaticTool}
                updateFn={updatePneumaticTool}
                transferBrigades={transferBrigades}
                transferKey='pneumaticToolIds'
            />
            <ItemSimpleTool
                selectedBrigade={selectedBrigade}
                searchQuery={searchQuery}
                title='Бензорізи'
                equipmentType='PetrolCutter'
                fetchFn={fetchPetrolCuttersByBrigade}
                createFn={createPetrolCutter}
                updateFn={updatePetrolCutter}
                transferBrigades={transferBrigades}
                transferKey='petrolCutterIds'
            />
            <ItemLightMast
                selectedBrigade={selectedBrigade}
                searchQuery={searchQuery}
                transferBrigades={transferBrigades}
            />

            {(toolLists || []).filter(list =>
                !searchQuery ||
                list.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                list.ToolItems?.some(i => i.name?.toLowerCase().includes(searchQuery.toLowerCase()))
            ).map((list) => (
                <ItemTool key={list.id} toolList={list} selectedBrigade={selectedBrigade} onItemCreated={refetch} searchQuery={searchQuery} transferBrigades={transferBrigades} />
            ))}


        </div>
    )
}

export default Toolscomponent
