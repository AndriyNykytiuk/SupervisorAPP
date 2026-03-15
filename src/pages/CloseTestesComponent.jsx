import React, { useState, useEffect } from 'react';
import ClosesTestitem from '../components/ClosesTestitem'
import Wastedtestitem from '../components/Wastedtestitem';
import '../scss/closestestitem.scss'

const CloseTestesComponent = () => {
    const [upcomingItems, setUpcomingItems] = useState([]);
    const [wastedItems, setWastedItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUpcoming = async () => {
            try {
                const token = localStorage.getItem('token');
                const resUpcoming = await fetch('/api/test-items/upcoming', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const resWasted = await fetch('/api/test-items/wasted', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (resUpcoming.ok && resWasted.ok) {
                    const dataUpcoming = await resUpcoming.json();
                    const dataWasted = await resWasted.json();
                    setUpcomingItems(dataUpcoming);
                    setWastedItems(dataWasted);
                }
            } catch (err) {
                console.error('Failed to fetch test items:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUpcoming();
    }, []);

    return (
        <div>
            <div className='title-wrapp'>
                {loading ? (
                    <p>Завантаження...</p>
                ) : wastedItems.length > 0 ? (
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


                {loading ? (
                    <p>Завантаження...</p>
                ) : upcomingItems.length > 0 ? (
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

