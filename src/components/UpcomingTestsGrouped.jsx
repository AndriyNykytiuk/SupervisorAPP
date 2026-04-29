import React, { useState } from 'react'
import '../scss/closestestitem.scss'

const formatDate = (dateString) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('uk-UA')
}

const UpcomingTestsGrouped = ({ items = [], searchQuery = '' }) => {
    const [expanded, setExpanded] = useState({})

    const groups = {}
    for (const item of items) {
        const key = item.testListId ?? `__nolist_${item.id}`
        if (!groups[key]) {
            groups[key] = {
                id: key,
                name: item.testList?.name || item.name || '—',
                items: [],
            }
        }
        groups[key].items.push(item)
    }

    const matches = (item, group) =>
        !searchQuery ||
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.inventoryNumber?.toString().toLowerCase().includes(searchQuery.toLowerCase())

    const visibleGroups = Object.values(groups)
        .map(g => ({ ...g, items: g.items.filter(it => matches(it, g)) }))
        .filter(g => g.items.length > 0)
        .sort((a, b) => a.name.localeCompare(b.name, 'uk'))

    if (visibleGroups.length === 0) return null

    const toggle = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))

    return (
        <div className='upcoming-grouped'>
            {visibleGroups.map(group => {
                const isOpen = !!expanded[group.id]
                return (
                    <div key={group.id} className='upcoming-group'>
                        <div
                            className='upcoming-group-header'
                            onClick={() => toggle(group.id)}
                            role='button'
                            tabIndex={0}
                        >
                            <h3>
                                {group.name}
                                <span className='count'> — {group.items.length} шт.</span>
                            </h3>
                            <span className='chevron'>{isOpen ? '▲' : '▼'}</span>
                        </div>
                        {isOpen && (
                            <div className='upcoming-group-body'>
                                <div className='item-header-row'>
                                    <span>назва обладнання</span>
                                    <span>інвентарний номер</span>
                                    <span>дата до коли треба випробувати</span>
                                    <span>приналежність</span>
                                </div>
                                {group.items.map(item => (
                                    <div key={item.id} className='close-test-item'>
                                        <div>{item.name}</div>
                                        <div>{item.inventoryNumber || '—'}</div>
                                        <div>{formatDate(item.nextTestDate)}</div>
                                        <div>{item.Brigade?.name || '—'}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default UpcomingTestsGrouped
