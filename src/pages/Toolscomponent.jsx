import React from 'react'
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
            <ItemElectricTool selectedBrigade={selectedBrigade} />
            <ItemWaterPump selectedBrigade={selectedBrigade} />
            <ItemHydravlicTool selectedBrigade={selectedBrigade} />
            {/* Окремий блок для засобів порятунку на воді */}
            <ItemSwimTool selectedBrigade={selectedBrigade} />
            <BackPackExtenguisher selectedBrigade={selectedBrigade} />

            {(toolLists || []).map((list) => (
                <ItemTool key={list.id} toolList={list} selectedBrigade={selectedBrigade} onItemCreated={refetch} />
            ))}


        </div>
    )
}

export default Toolscomponent
