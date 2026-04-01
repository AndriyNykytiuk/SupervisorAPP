import React, { useState } from 'react'
import { fetchToolItemsByBrigade } from '../api/services.js';
import useApi from '../hooks/useApi.js';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import ErrorMessage from '../components/ui/ErrorMessage.jsx';
import ItemTool from '../components/ItemTool.jsx'
import ItemElectricTool from '../components/ItemElectricTool.jsx'
import ItemWaterPump from '../components/ItemWaterPump.jsx'
import ItemHydravlicTool from '../components/ItemHydravlicTool.jsx'
import ItemSwimTool from '../components/ItemSwimTool.jsx'
import BackPackExtenguisher from '../components/backPackExtenguisher.jsx'
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

    if (!selectedBrigade) {
        return <p>Оберіть частину бо так і будемо дивитися один на одного</p>
    }

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} onRetry={refetch} />;


    return (
        <div>
            <div className='toolscomponent-header'>
                <h2>Відомості ПТО та АРО</h2>
            </div>
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Пошук за назвою обладнання..." />
            <ItemElectricTool selectedBrigade={selectedBrigade} searchQuery={searchQuery} />
            <ItemWaterPump selectedBrigade={selectedBrigade} searchQuery={searchQuery} />
            <ItemHydravlicTool selectedBrigade={selectedBrigade} searchQuery={searchQuery} />
            <ItemSwimTool selectedBrigade={selectedBrigade} searchQuery={searchQuery} />
            <BackPackExtenguisher selectedBrigade={selectedBrigade} searchQuery={searchQuery} />

            {(toolLists || []).filter(list =>
                !searchQuery ||
                list.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                list.ToolItems?.some(i => i.name?.toLowerCase().includes(searchQuery.toLowerCase()))
            ).map((list) => (
                <ItemTool key={list.id} toolList={list} selectedBrigade={selectedBrigade} onItemCreated={refetch} searchQuery={searchQuery} />
            ))}


        </div>
    )
}

export default Toolscomponent
