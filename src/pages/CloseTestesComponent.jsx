import React, { useState } from 'react';
import {
    fetchUpcomingTestItems,
    fetchWastedTestItems,
    fetchUpcomingFireExtenguishers,
    fetchWastedFireExtenguishers,
} from '../api/services.js';
import useApi from '../hooks/useApi.js';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import ErrorMessage from '../components/ui/ErrorMessage.jsx';
import UpcomingTestsGrouped from '../components/UpcomingTestsGrouped.jsx'
import Wastedtestitem from '../components/Wastedtestitem';
import '../scss/closestestitem.scss'

// Reshape a FireExtenguisher row to look like a TestItem so it slots into
// the same upcoming/wasted UI grouped under "Вогнегасники".
const extToTestShape = (ext) => ({
    id: `ext_${ext.id}`,
    name: ext.extinguisherType,
    inventoryNumber: ext.inventoryNumber,
    nextTestDate: ext.nextMaintenanceDate,
    Brigade: ext.Brigade,
    testListId: 'fire-extenguisher',
    testList: { id: 'fire-extenguisher', name: 'Вогнегасники' },
})

const CloseTestesComponent = () => {
    const { data: upcomingItems, loading: loadingUpcoming, error: errorUpcoming, refetch: refetchUpcoming } =
        useApi(() => fetchUpcomingTestItems(), [])
    const { data: wastedItems, loading: loadingWasted, error: errorWasted, refetch: refetchWasted } =
        useApi(() => fetchWastedTestItems(), [])
    const { data: upcomingExt, loading: loadingUpExt, error: errorUpExt, refetch: refetchUpExt } =
        useApi(() => fetchUpcomingFireExtenguishers(), [])
    const { data: wastedExt, loading: loadingWaExt, error: errorWaExt, refetch: refetchWaExt } =
        useApi(() => fetchWastedFireExtenguishers(), [])

    const loading = loadingUpcoming || loadingWasted || loadingUpExt || loadingWaExt;
    const error = errorUpcoming || errorWasted || errorUpExt || errorWaExt;
    const [searchQuery] = useState('');

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} onRetry={() => { refetchUpcoming(); refetchWasted(); refetchUpExt(); refetchWaExt(); }} />;

    const allUpcoming = [...(upcomingItems || []), ...((upcomingExt || []).map(extToTestShape))]
    const allWasted = [...(wastedItems || []), ...((wastedExt || []).map(extToTestShape))]
    const wastedFiltered = allWasted.filter(i => i.name?.toLowerCase().includes(searchQuery.toLowerCase()))

    return (
        <div>
            <div className='title-wrapp'>
                {wastedFiltered.length > 0 ? (
                    <div className='item-wrapp'>
                        <div>
                            <h3>Обладнання, яке не випробували</h3>
                        </div>
                        <div className='item-header-row'>
                            <span>назва обладнання</span>
                            <span>інвентарний номер</span>
                            <span>дата до коли треба випробувати</span>
                            <span>приналежність</span>
                        </div>
                        {wastedFiltered.map(item => (
                            <Wastedtestitem key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <h4 className='green-bg'>Протермінованих випробувань немає.</h4>
                )}
            </div>


            <div className='item-wrapp'>
                {allUpcoming.length > 0 ? (
                    <>
                        <div className='header-title'>
                            <h2> Найближчі випробування </h2>
                        </div>
                        <UpcomingTestsGrouped items={allUpcoming} searchQuery={searchQuery} />
                    </>
                ) : (
                    <p style={{ textAlign: 'center', padding: '1rem', color: 'green' }}>На найближчі 10 днів випробувань не заплановано.</p>
                )}
            </div>
        </div>
    );
};

export default CloseTestesComponent;
