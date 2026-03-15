import React, { useState, useEffect } from 'react'
import ItemTool from '../components/ItemTool.jsx'
import ItemElectricTool from '../components/ItemElectricTool.jsx'
import ItemWaterPump from '../components/ItemWaterPump.jsx'
import ItemHydravlicTool from '../components/ItemHydravlicTool.jsx'
import ItemSwimTool from '../components/ItemSwimTool.jsx'
import '../scss/toolscomponent.scss'

const Toolscomponent = ({ selectedBrigade }) => {
    const [toolLists, setToolLists] = useState([])

    const fetchData = async () => {
        if (!selectedBrigade) return
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/tool-items/brigade/${selectedBrigade}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            setToolLists(data)
        } catch (err) {
            console.error('Failed to fetch tool items:', err)
        }
    }

    useEffect(() => {
        fetchData()
    }, [selectedBrigade])

    if (!selectedBrigade) {
        return <p>Оберіть частину бо так і будемо дивитися один на одного</p>
    }

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

            {toolLists.map((list) => (
                <ItemTool key={list.id} toolList={list} selectedBrigade={selectedBrigade} onItemCreated={fetchData} />
            ))}


        </div>
    )
}

export default Toolscomponent
