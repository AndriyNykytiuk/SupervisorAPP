import React, { useState, useEffect } from 'react'
import '../scss/transfercomponent.scss'

const Transfercomponent = ({ selectedBrigade }) => {
    const [testLists, setTestLists] = useState([])
    const [toolLists, setToolLists] = useState([])
    const [electricStations, setElectricStations] = useState([])
    const [hydravlicTools, setHydravlicTools] = useState([])
    const [swimTools, setSwimTools] = useState([])
    const [selectedTestItems, setSelectedTestItems] = useState([])
    const [selectedToolItems, setSelectedToolItems] = useState([])
    const [selectedElectricStations, setSelectedElectricStations] = useState([])
    const [selectedHydravlicTools, setSelectedHydravlicTools] = useState([])
    const [swimToolTransfers, setSwimToolTransfers] = useState({})
    const [toBrigadeId, setToBrigadeId] = useState('')
    const [brigades, setBrigades] = useState([])
    const [message, setMessage] = useState('')

    const fetchData = async () => {
        if (!selectedBrigade) return
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/transfer/brigade/${selectedBrigade}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            setTestLists(data.testLists || [])
            setToolLists(data.toolLists || [])
            setElectricStations(data.electricStations || [])
            setHydravlicTools(data.hydravlicTools || [])
            setSwimTools(data.swimTools || [])
            setSelectedTestItems([])
            setSelectedToolItems([])
            setSelectedElectricStations([])
            setSelectedHydravlicTools([])
            setSwimToolTransfers({})
        } catch (err) {
            console.error('Failed to fetch transfer data:', err)
        }
    }

    // Fetch brigades for target selector
    useEffect(() => {
        const fetchBrigades = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await fetch('/api/transfer/brigades', {
                    headers: { Authorization: `Bearer ${token}` },
                })
                const data = await res.json()
                const allBrigades = []
                data.forEach((det) => {
                    det.Brigades?.forEach((brig) => {
                        allBrigades.push({ ...brig, detachmentName: det.name })
                    })
                })
                setBrigades(allBrigades)
            } catch (err) {
                console.error('Failed to fetch brigades:', err)
            }
        }
        fetchBrigades()
    }, [])

    useEffect(() => {
        fetchData()
    }, [selectedBrigade])

    const toggleTestItem = (id) => {
        setSelectedTestItems((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        )
    }

    const toggleToolItem = (id) => {
        setSelectedToolItems((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        )
    }

    const toggleElectricStation = (id) => {
        setSelectedElectricStations((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        )
    }

    const toggleHydravlicTool = (id) => {
        setSelectedHydravlicTools((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        )
    }

    const handleSwimToolChange = (id, field, value) => {
        setSwimToolTransfers((prev) => ({
            ...prev,
            [id]: {
                ...(prev[id] || {}),
                [field]: Number(value) || 0,
            },
        }))
    }

    const handleTransfer = async () => {
        if (!toBrigadeId) {
            setMessage('Оберіть бригаду призначення')
            return
        }

        const transferArray = Object.keys(swimToolTransfers)
            .map((id) => ({
                id: Number(id),
                transferData: swimToolTransfers[id],
            }))
            .filter((t) => Object.values(t.transferData).some((val) => val > 0))

        if (selectedTestItems.length === 0 && selectedToolItems.length === 0 && selectedElectricStations.length === 0 && selectedHydravlicTools.length === 0 && transferArray.length === 0) {
            setMessage('Оберіть елементи для передачі')
            return
        }

        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/transfer', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    testItemIds: selectedTestItems,
                    toolItemIds: selectedToolItems,
                    electricStationIds: selectedElectricStations,
                    hydravlicToolIds: selectedHydravlicTools,
                    swimToolTransfers: transferArray,
                    toBrigadeId: Number(toBrigadeId),
                }),
            })

            if (res.ok) {
                const data = await res.json()
                const count = (data.testItems?.length || 0) + (data.toolItems?.length || 0) + (data.electricStations?.length || 0) + (data.hydravlicTools?.length || 0) + (data.swimTools?.length || 0)
                setMessage(`✅ Передано ${count} об'єктів/категорій`)
                setSelectedTestItems([])
                setSelectedToolItems([])
                setSelectedElectricStations([])
                setSelectedHydravlicTools([])
                setSwimToolTransfers({})
                setToBrigadeId('')
                fetchData()
            } else {
                const err = await res.json()
                setMessage(`❌ ${err.error}`)
            }
        } catch (err) {
            setMessage('❌ Помилка з\'єднання')
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return '—'
        return new Date(dateString).toLocaleDateString('uk-UA')
    }

    if (!selectedBrigade) {
        return <p>Обрати частину </p>
    }

    return (
        <div>
            <div className='transfercomponent-header'>
                <h2>Передача майна</h2>
            </div>


            <div className='transfer-wrapper'>
                <div className='item-header-transfer'>
                    <div>
                        <h3>Передати в частину:</h3>
                    </div>
                    <select value={toBrigadeId} onChange={(e) => setToBrigadeId(e.target.value)}>
                        <option value="">Оберіть частину</option>
                        {brigades
                            .filter((b) => b.id !== selectedBrigade)
                            .map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.detachmentName} — {b.name}
                                </option>
                            ))}
                    </select>
                    <button onClick={handleTransfer}>Передати</button>
                </div>
                {message && <p>{message}</p>}
            </div>

            {testLists.map((list) => (
                <div key={`test-${list.id}`} className='transfer-wrapper'>
                    <div className='item-header-title'>
                        <h2>{list.name}</h2>
                    </div>
                    {list.TestItems?.length > 0 && (
                        <div className='item-header-row test-transfer-row'>
                            <span>Вибрати</span>
                            <span>Інвентарний номер</span>
                            <span>Назва обладнання</span>
                            <span>Результат</span>
                            <span>Дата випробування</span>
                            <span>Наступне випробування</span>
                        </div>
                    )}
                    <div className='item-body'>
                        {list.TestItems?.length > 0 ? (
                            list.TestItems.map((item) => (
                                <div key={item.id} className={`item-row test-transfer-row ${item.result === 'pass' ? 'item-pass' : item.result === 'fail' ? 'item-fail' : ''}`}>
                                    <input
                                        type='checkbox'
                                        className='transfer-checkbox'
                                        checked={selectedTestItems.includes(item.id)}
                                        onChange={() => toggleTestItem(item.id)}
                                    />
                                    <span title="Інв. номер">{item.inventoryNumber || '—'}</span>
                                    <span title="Назва">{item.name}</span>
                                    <span title="Результат">{item.result === 'pass' ? 'Придатний' : item.result === 'fail' ? 'Непридатний' : item.result}</span>
                                    <span title="Дата">{formatDate(item.testDate)}</span>
                                    <span title="Наступне">{formatDate(item.nextTestDate)}</span>
                                </div>
                            ))
                        ) : (
                            <p>Частина такого обладнання поки немає</p>
                        )}
                    </div>
                </div>
            ))}

            {toolLists.map((list) => (
                <div key={`tool-${list.id}`} className='transfer-wrapper'>
                    <div className='item-header-title'>
                        <h2>{list.name}</h2>
                    </div>
                    {list.ToolItems?.length > 0 && (
                        <div className='item-header-row tool-transfer-row'>
                            <span>Вибрати</span>
                            <span>Назва обладнання</span>
                            <span>Рік закупівлі</span>
                            <span>Потужність</span>
                            <span>Місце зберігання</span>
                            <span>Кількість</span>
                            <span>Примітки</span>
                        </div>
                    )}
                    <div className='item-body'>
                        {list.ToolItems?.length > 0 ? (
                            list.ToolItems.map((item) => (
                                <div key={item.id} className='item-row tool-transfer-row'>
                                    <input
                                        type='checkbox'
                                        className='transfer-checkbox'
                                        checked={selectedToolItems.includes(item.id)}
                                        onChange={() => toggleToolItem(item.id)}
                                    />
                                    <span title="Назва">{item.name}</span>
                                    <span title="Рік">{item.yearOfPurchase || '—'}</span>
                                    <span title="Потужність">{item.powerfull || '—'}</span>
                                    <span title="Місце">{item.storagePlace || '—'}</span>
                                    <span title="Кількість">{item.quantity ?? 0}</span>
                                    <span title="Примітки">{item.notes || '—'}</span>
                                </div>
                            ))
                        ) : (
                            <p>Частина такого обладнання поки немає</p>
                        )}
                    </div>
                </div>
            ))}

            {electricStations.length > 0 && (
                <div className='transfer-wrapper'>
                    <div className='item-header-title'>
                        <h2>Електростанції/Генератори</h2>
                    </div>
                    <div className='item-header-row electric-station-row tool-transfer-row' style={{ gridTemplateColumns: '0.1fr 1.5fr 0.5fr 0.8fr 1.5fr 1.5fr' }}>
                        <span className='transfer-checkbox'></span>
                        <span>назва обладнання</span>
                        <span>рік закупівлі</span>
                        <span>потужність (кВт)</span>
                        <span>місце зберігання</span>
                        <span>примітки</span>
                    </div>
                    <div className='item-body'>
                        {electricStations.map((item) => (
                            <div key={item.id} className='item-row electric-station-row tool-transfer-row' style={{ gridTemplateColumns: '0.1fr 1.5fr 0.5fr 0.8fr 1.5fr 1.5fr' }}>
                                <input
                                    type='checkbox'
                                    className='transfer-checkbox'
                                    checked={selectedElectricStations.includes(item.id)}
                                    onChange={() => toggleElectricStation(item.id)}
                                />
                                <span style={{ flex: '1.5' }} title="Назва">{item.name}</span>
                                <span style={{ flex: '0.5' }} title="Рік закупівлі">{item.yaerOfPurchase || '—'}</span>
                                <span style={{ flex: '0.8' }} title="Потужність (кВт)">{item.powerOf || '—'}</span>
                                <span style={{ flex: '1.5' }} title="Місце зберігання">{item.placeOfStorage || '—'}</span>
                                <span style={{ flex: '1.5' }} title="Примітки">{item.notes || '—'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {hydravlicTools.length > 0 && (
                <div className='transfer-wrapper'>
                    <div className='item-header-title'>
                        <h2>Гідравлічний та електричний інструмент</h2>
                    </div>
                    <div className='item-header-row hydravlic-tool-row tool-transfer-row' style={{ gridTemplateColumns: '0.1fr 1.5fr 0.5fr 0.8fr 1.5fr 1.5fr' }}>
                        <span className='transfer-checkbox'></span>
                        <span>назва обладнання</span>
                        <span>рік закупівлі</span>
                        <span>тип приводу</span>
                        <span>місце зберігання</span>
                        <span>примітки</span>
                    </div>
                    <div className='item-body'>
                        {hydravlicTools.map((item) => (
                            <div key={item.id} className='item-row hydravlic-tool-row tool-transfer-row' style={{ gridTemplateColumns: '0.1fr 1.5fr 0.5fr 0.8fr 1.5fr 1.5fr' }}>
                                <input
                                    type='checkbox'
                                    className='transfer-checkbox'
                                    checked={selectedHydravlicTools.includes(item.id)}
                                    onChange={() => toggleHydravlicTool(item.id)}
                                />
                                <span style={{ flex: '1.5' }} title="Назва">{item.name}</span>
                                <span style={{ flex: '0.5' }} title="Рік закупівлі">{item.yaerOfPurchase || '—'}</span>
                                <span style={{ flex: '0.8' }} title="Тип приводу">{item.typeOfStern || '—'}</span>
                                <span style={{ flex: '1.5' }} title="Місце зберігання">{item.placeOfStorage || '—'}</span>
                                <span style={{ flex: '1.5' }} title="Примітки">{item.notes || '—'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {swimTools.length > 0 && (
                <div className='transfer-wrapper'>
                    <div className='item-header-title'>
                        <h2>Засоби порятунку на воді (введіть кількість для передачі)</h2>
                    </div>
                    <div className='item-header-row swim-tool-row' style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr' }}>
                        <span title="Рятувальні човни">РЯТ. ЧОВНИ</span>
                        <span title="Моторні рятувальні човни">МОТОР. ЧОВНИ</span>
                        <span title="Рятувальні круги">КРУГИ</span>
                        <span title="Рятувальні мотузки">МОТУЗКИ</span>
                        <span title="Кінець Александрова">КІН. АЛЕКС.</span>
                        <span title="Рятувальні сани">САНИ</span>
                        <span title="Рятувальні жилети">ЖИЛЕТИ</span>
                        <span title="Сухі гідрокостюми">ГІДРОКОСТЮМИ</span>
                    </div>
                    <div className='item-body'>
                        {swimTools.map((item) => {
                            const renderTransferInput = (field, maxVal) => {
                                if (!maxVal || maxVal <= 0) return '0';
                                return (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                        <input
                                            type='number'
                                            min='0'
                                            max={maxVal}
                                            value={swimToolTransfers[item.id]?.[field] || ''}
                                            onChange={(e) => handleSwimToolChange(item.id, field, e.target.value)}
                                            style={{ width: '40px', padding: '2px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '4px' }}
                                        />
                                        <span style={{ fontSize: '0.7em', color: '#666' }}>з {maxVal}</span>
                                    </div>
                                );
                            };

                            return (
                                <div key={item.id} className='item-row swim-tool-row' style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr' }}>
                                    <span title="Рятувальні човни">{renderTransferInput('lifeBoat', item.lifeBoat)}</span>
                                    <span title="Моторні рятувальні човни">{renderTransferInput('motorLifeBoat', item.motorLifeBoat)}</span>
                                    <span title="Рятувальні круги">{renderTransferInput('lifeBouy', item.lifeBouy)}</span>
                                    <span title="Рятувальні мотузки">{renderTransferInput('lifeRoup', item.lifeRoup)}</span>
                                    <span title="Кінець Александрова">{renderTransferInput('lifePath', item.lifePath)}</span>
                                    <span title="Рятувальні сани">{renderTransferInput('rescueSlad', item.rescueSlad)}</span>
                                    <span title="Рятувальні жилети">{renderTransferInput('lifeJacket', item.lifeJacket)}</span>
                                    <span title="Сухі гідрокостюми">{renderTransferInput('drySuits', item.drySuits)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Transfercomponent
