import React from 'react';
import { fetchUpcomingTestItems, fetchWastedTestItems } from '../api/services.js';
import useApi from '../hooks/useApi.js';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import ErrorMessage from '../components/ui/ErrorMessage.jsx';
import ClosesTestitem from '../components/ClosesTestitem'
import Wastedtestitem from '../components/Wastedtestitem';
import '../scss/closestestitem.scss'

const CloseTestesComponent = () => {
    const {
        data: upcomingItems,
        loading: loadingUpcoming,
        error: errorUpcoming,
        refetch: refetchUpcoming
    } = useApi(() => fetchUpcomingTestItems(), []);

    const {
        data: wastedItems,
        loading: loadingWasted,
        error: errorWasted,
        refetch: refetchWasted
    } = useApi(() => fetchWastedTestItems(), []);

    const loading = loadingUpcoming || loadingWasted;
    const error = errorUpcoming || errorWasted;

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} onRetry={() => { refetchUpcoming(); refetchWasted(); }} />;

    return (
        <div>
            <div className='title-wrapp'>
                {(wastedItems || []).length > 0 ? (
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
                        {wastedItems.map(item => (
                            <Wastedtestitem key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <h4 className='green-bg'>Протермінованих випробувань немає.</h4>
                )}
            </div>


            <div className='item-wrapp'>
                {(upcomingItems || []).length > 0 ? (
                    <>
                    <div className='header-title'>
                         <h2> Найближчі випробування </h2>
                    </div>
                        <div className='item-header-row'>
                            <span>назва обладнання</span>
                            <span>інвентарний номер</span>
                            <span>дата до коли треба випробувати</span>
                            <span>приналежність</span>
                        </div>
                        {upcomingItems.map(item => (
                            <ClosesTestitem key={item.id} item={item} />
                        ))}
                    </>
                ) : (
                    <p style={{ textAlign: 'center', padding: '1rem', color: 'green' }}>На найближчі 10 днів випробувань не заплановано.</p>
                )}
            </div>
        </div>
    );
};

export default CloseTestesComponent;
