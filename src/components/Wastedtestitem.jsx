
import React from 'react'
import '../scss/wastedtestitem.scss'
const Wastedtestitem = ({ item }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '—'
        return new Date(dateString).toLocaleDateString('uk-UA')
    }

    return (
        <div className='waste-test-item'>
            <div>{item?.name}</div>
            <div>{item?.inventoryNumber || '—'}</div>
            <div>{formatDate(item?.nextTestDate)}</div>
            <div>{item?.Brigade?.name || '—'}</div>
        </div>
    );
};



export default Wastedtestitem

