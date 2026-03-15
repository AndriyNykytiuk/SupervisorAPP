import React from 'react';
import '../scss/closestestitem.scss'

const ClosesTestitem = ({ item }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '—'
        return new Date(dateString).toLocaleDateString('uk-UA')
    }

    return (
        <div className='close-test-item'>
            <div>{item?.name}</div>
            <div>{item?.inventoryNumber || '—'}</div>
            <div>{formatDate(item?.nextTestDate)}</div>
            <div>{item?.Brigade?.name || '—'}</div>
        </div>
    );
};

export default ClosesTestitem;

