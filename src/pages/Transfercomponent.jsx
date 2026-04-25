import React, { useState, useEffect } from 'react'
import {
    fetchTransferDataByBrigade,
    fetchTransferBrigades,
    transferItems
} from '../api/services.js';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import SearchBar from '../components/ui/SearchBar.jsx';
import '../scss/transfercomponent.scss'

const Transfercomponent = ({ selectedBrigade }) => {
    const [testLists, setTestLists] = useState([])
    const [toolLists, setToolLists] = useState([])
    const [electricStations, setElectricStations] = useState([])
    const [waterPumps, setWaterPumps] = useState([])
    const [hydravlicTools, setHydravlicTools] = useState([])
    const [swimTools, setSwimTools] = useState([])
    const [specialTools, setSpecialTools] = useState([])
    const [backPackExtenguishers, setBackPackExtenguishers] = useState([])
    const [chainSaws, setChainSaws] = useState([])
    const [pneumaticTools, setPneumaticTools] = useState([])
    const [petrolCutters, setPetrolCutters] = useState([])
    const [lightMasts, setLightMasts] = useState([])
    const [selectedTestItems, setSelectedTestItems] = useState([])
    const [selectedToolItems, setSelectedToolItems] = useState([])
    const [selectedElectricStations, setSelectedElectricStations] = useState([])
    const [selectedWaterPumps, setSelectedWaterPumps] = useState([])
    const [selectedHydravlicTools, setSelectedHydravlicTools] = useState([])
    const [selectedSpecialTools, setSelectedSpecialTools] = useState([])
    const [selectedBackPackExtenguishers, setSelectedBackPackExtenguishers] = useState([])
    const [selectedChainSaws, setSelectedChainSaws] = useState([])
    const [selectedPneumaticTools, setSelectedPneumaticTools] = useState([])
    const [selectedPetrolCutters, setSelectedPetrolCutters] = useState([])
    const [selectedLightMasts, setSelectedLightMasts] = useState([])
    const [swimToolTransfers, setSwimToolTransfers] = useState({})
    const [toBrigadeId, setToBrigadeId] = useState('')
    const [brigades, setBrigades] = useState([])
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [expandedSections, setExpandedSections] = useState({})

    const toggleSection = (key) => {
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const fetchData = async () => {
        if (!selectedBrigade) return
        setLoading(true)
        try {
            const data = await fetchTransferDataByBrigade(selectedBrigade);
            setTestLists(data.testLists || [])
            setToolLists(data.toolLists || [])
            setElectricStations(data.electricStations || [])
            setWaterPumps(data.waterPumps || [])
            setHydravlicTools(data.hydravlicTools || [])
            setSwimTools(data.swimTools || [])
            setSpecialTools(data.specialTools || [])
            setBackPackExtenguishers(data.backPackExtenguishers || [])
            setChainSaws(data.chainSaws || [])
            setPneumaticTools(data.pneumaticTools || [])
            setPetrolCutters(data.petrolCutters || [])
            setLightMasts(data.lightMasts || [])
            setSelectedTestItems([])
            setSelectedToolItems([])
            setSelectedElectricStations([])
            setSelectedWaterPumps([])
            setSelectedHydravlicTools([])
            setSelectedSpecialTools([])
            setSelectedBackPackExtenguishers([])
            setSelectedChainSaws([])
            setSelectedPneumaticTools([])
            setSelectedPetrolCutters([])
            setSelectedLightMasts([])
            setSwimToolTransfers({})
        } catch (err) {
            console.error('Failed to fetch transfer data:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const loadBrigades = async () => {
            try {
                const data = await fetchTransferBrigades();
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
        loadBrigades()
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

    const toggleWaterPump = (id) => {
        setSelectedWaterPumps((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        )
    }

    const toggleHydravlicTool = (id) => {
        setSelectedHydravlicTools((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        )
    }

    const toggleSpecialTool = (id) => {
        setSelectedSpecialTools((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        )
    }

    const toggleBackPackExtenguisher = (id) => {
        setSelectedBackPackExtenguishers((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        )
    }

    const toggleChainSaw = (id) => {
        setSelectedChainSaws((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        )
    }

    const togglePneumaticTool = (id) => {
        setSelectedPneumaticTools((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        )
    }

    const togglePetrolCutter = (id) => {
        setSelectedPetrolCutters((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        )
    }

    const toggleLightMast = (id) => {
        setSelectedLightMasts((prev) =>
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
            setMessage('Оберіть частину призначення')
            return
        }

        const transferArray = Object.keys(swimToolTransfers)
            .map((id) => ({
                id: Number(id),
                transferData: swimToolTransfers[id],
            }))
            .filter((t) => Object.values(t.transferData).some((val) => val > 0))

        if (
            selectedTestItems.length === 0 &&
            selectedToolItems.length === 0 &&
            selectedElectricStations.length === 0 &&
            selectedWaterPumps.length === 0 &&
            selectedHydravlicTools.length === 0 &&
            selectedSpecialTools.length === 0 &&
            selectedBackPackExtenguishers.length === 0 &&
            selectedChainSaws.length === 0 &&
            selectedPneumaticTools.length === 0 &&
            selectedPetrolCutters.length === 0 &&
            selectedLightMasts.length === 0 &&
            transferArray.length === 0
        ) {
            setMessage('Оберіть елементи для передачі')
            return
        }

        try {
            const data = await transferItems({
                testItemIds: selectedTestItems,
                toolItemIds: selectedToolItems,
                electricStationIds: selectedElectricStations,
                waterPumpIds: selectedWaterPumps,
                hydravlicToolIds: selectedHydravlicTools,
                specialToolIds: selectedSpecialTools,
                backPackExtenguisherIds: selectedBackPackExtenguishers,
                chainSawIds: selectedChainSaws,
                pneumaticToolIds: selectedPneumaticTools,
                petrolCutterIds: selectedPetrolCutters,
                lightMastIds: selectedLightMasts,
                swimToolTransfers: transferArray,
                toBrigadeId: Number(toBrigadeId),
            });

            const count =
                (data.testItems?.length || 0) +
                (data.toolItems?.length || 0) +
                (data.electricStations?.length || 0) +
                (data.waterPumps?.length || 0) +
                (data.hydravlicTools?.length || 0) +
                (data.specialTools?.length || 0) +
                (data.backPackExtenguishers?.length || 0) +
                (data.chainSaws?.length || 0) +
                (data.pneumaticTools?.length || 0) +
                (data.petrolCutters?.length || 0) +
                (data.lightMasts?.length || 0) +
                (data.swimTools?.length || 0)
            setMessage(`✅ Передано ${count} об'єктів/категорій`)
            setSelectedTestItems([])
            setSelectedToolItems([])
            setSelectedElectricStations([])
            setSelectedWaterPumps([])
            setSelectedHydravlicTools([])
            setSelectedSpecialTools([])
            setSelectedBackPackExtenguishers([])
            setSelectedChainSaws([])
            setSelectedPneumaticTools([])
            setSelectedPetrolCutters([])
            setSelectedLightMasts([])
            setSwimToolTransfers({})
            setToBrigadeId('')
            fetchData()
        } catch (err) {
            const errorMsg = err?.response?.data?.error || "Помилка з'єднання";
            setMessage(`❌ ${errorMsg}`)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return '—'
        return new Date(dateString).toLocaleDateString('uk-UA')
    }

    if (!selectedBrigade) {
        return <p>Обрати частину </p>
    }

    if (loading) return <LoadingSpinner />;

    // Helper: renders a collapsible section header
    const SectionHeader = ({ sectionKey, title }) => (
        <div
            className='item-header-title'
            onClick={() => toggleSection(sectionKey)}
            style={{ cursor: 'pointer', userSelect: 'none' }}
        >
            <h2>
                {title}
                <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', opacity: 0.6 }}>
                    {expandedSections[sectionKey] ? '▲' : '▼'}
                </span>
            </h2>
        </div>
    )

    const isOpen = (key) => expandedSections[key] || !!searchQuery

    return (
        <div>
            <div className='transfercomponent-header'>
                <h2>Передача майна</h2>
            </div>
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Пошук за назвою..." />

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

            {/* ── TestLists ── */}
            {testLists.filter(list =>
                !searchQuery ||
                list.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                list.TestItems?.some(i => i.name?.toLowerCase().includes(searchQuery.toLowerCase()))
            ).map((list) => (
                <div key={`test-${list.id}`} className='transfer-wrapper'>
                    <SectionHeader sectionKey={`test-${list.id}`} title={list.name} />
                    {isOpen(`test-${list.id}`) && (
                        <>
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
                                    list.TestItems.filter(i =>
                                        !searchQuery ||
                                        list.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        i.name?.toLowerCase().includes(searchQuery.toLowerCase())
                                    ).map((item) => (
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
                        </>
                    )}
                </div>
            ))}

            {/* ── ToolLists ── */}
            {toolLists.filter(list =>
                !searchQuery ||
                list.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                list.ToolItems?.some(i => 
                    i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    i.powerfull?.toString().includes(searchQuery.toLowerCase())
                )
            ).map((list) => (
                <div key={`tool-${list.id}`} className='transfer-wrapper'>
                    <SectionHeader sectionKey={`tool-${list.id}`} title={list.name} />
                    {isOpen(`tool-${list.id}`) && (
                        <>
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
                                    list.ToolItems.filter(i =>
                                        !searchQuery ||
                                        list.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        i.powerfull?.toString().includes(searchQuery.toLowerCase())
                                    ).map((item) => (
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
                        </>
                    )}
                </div>
            ))}

            {/* ── Електростанції ── */}
            {(!searchQuery ||
                'Електростанції/Генератори'.toLowerCase().includes(searchQuery.toLowerCase()) ||
                electricStations.some(i =>
                    i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    i.powerOf?.toString().includes(searchQuery.toLowerCase())
                )
            ) && (
                    <div className='transfer-wrapper'>
                        <SectionHeader sectionKey='electricStations' title='Електростанції/Генератори' />
                        {isOpen('electricStations') && (
                            <>
                                {electricStations?.length > 0 && (
                                    <div className='item-header-row electric-station-row tool-transfer-row' style={{ gridTemplateColumns: '0.1fr 1.5fr 0.5fr 0.8fr 1.5fr 1.5fr' }}>
                                        <span className='transfer-checkbox'></span>
                                        <span>назва обладнання</span>
                                        <span>рік закупівлі</span>
                                        <span>потужність (кВт)</span>
                                        <span>місце зберігання</span>
                                        <span>примітки</span>
                                    </div>
                                )}
                                <div className='item-body'>
                                    {electricStations?.length > 0 ? (
                                        electricStations.filter(i =>
                                            !searchQuery ||
                                            'Електростанції/Генератори'.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            i.powerOf?.toString().includes(searchQuery.toLowerCase())
                                        ).map((item) => (
                                            <div key={item.id} className='item-row electric-station-row tool-transfer-row' style={{ gridTemplateColumns: '0.1fr 1.5fr 0.5fr 0.8fr 1.5fr 1.5fr' }}>
                                                <input
                                                    type='checkbox'
                                                    className='transfer-checkbox'
                                                    checked={selectedElectricStations.includes(item.id)}
                                                    onChange={() => toggleElectricStation(item.id)}
                                                />
                                                <span title="Назва">{item.name}</span>
                                                <span title="Рік закупівлі">{item.yaerOfPurchase || '—'}</span>
                                                <span title="Потужність (кВт)">{item.powerOf || '—'}</span>
                                                <span title="Місце зберігання">{item.placeOfStorage || '—'}</span>
                                                <span title="Примітки">{item.notes || '—'}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p>Частина такого обладнання поки немає</p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}

            {/* ── Мотопомпи ── */}
            {(!searchQuery ||
                'Мотопомпи'.toLowerCase().includes(searchQuery.toLowerCase()) ||
                waterPumps.some(i =>
                    i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    i.powerOf?.toString().includes(searchQuery.toLowerCase())
                )
            ) && (
                    <div className='transfer-wrapper'>
                        <SectionHeader sectionKey='waterPumps' title='Мотопомпи' />
                        {isOpen('waterPumps') && (
                            <>
                                {waterPumps?.length > 0 && (
                                    <div className='item-header-row electric-station-row tool-transfer-row' style={{ gridTemplateColumns: '0.1fr 1.5fr 0.5fr 0.8fr 1.5fr 1.5fr' }}>
                                        <span className='transfer-checkbox'></span>
                                        <span>назва обладнання</span>
                                        <span>рік закупівлі</span>
                                        <span>потужність</span>
                                        <span>місце зберігання</span>
                                        <span>примітки</span>
                                    </div>
                                )}
                                <div className='item-body'>
                                    {waterPumps?.length > 0 ? (
                                        waterPumps.filter(i =>
                                            !searchQuery ||
                                            'Мотопомпи'.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            i.powerOf?.toString().includes(searchQuery.toLowerCase())
                                        ).map((item) => (
                                            <div key={item.id} className='item-row electric-station-row tool-transfer-row' style={{ gridTemplateColumns: '0.1fr 1.5fr 0.5fr 0.8fr 1.5fr 1.5fr' }}>
                                                <input
                                                    type='checkbox'
                                                    className='transfer-checkbox'
                                                    checked={selectedWaterPumps.includes(item.id)}
                                                    onChange={() => toggleWaterPump(item.id)}
                                                />
                                                <span title="Назва">{item.name}</span>
                                                <span title="Рік закупівлі">{item.yearOfPurchase || '—'}</span>
                                                <span title="Потужність">{item.powerOf || '—'}</span>
                                                <span title="Місце зберігання">{item.placeOfStorage || '—'}</span>
                                                <span title="Примітки">{item.notes || '—'}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p>Частина такого обладнання поки немає</p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}

            {/* ── Гідравлічний інструмент ── */}
            {(!searchQuery ||
                'Гідравлічний'.toLowerCase().includes(searchQuery.toLowerCase()) ||
                hydravlicTools.some(i =>
                    i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    i.typeOfStern?.toLowerCase().includes(searchQuery.toLowerCase())
                )
            ) && (
                    <div className='transfer-wrapper'>
                        <SectionHeader sectionKey='hydravlicTools' title='Гідравлічний інструмент' />
                        {isOpen('hydravlicTools') && (
                            <>
                                {hydravlicTools?.length > 0 && (
                                    <div className='item-header-row hydravlic-tool-row tool-transfer-row' style={{ gridTemplateColumns: '0.1fr 1.5fr 0.5fr 0.8fr 1.5fr 1.5fr' }}>
                                        <span className='transfer-checkbox'></span>
                                        <span>назва обладнання</span>
                                        <span>рік закупівлі</span>
                                        <span>тип приводу</span>
                                        <span>місце зберігання</span>
                                        <span>примітки</span>
                                    </div>
                                )}
                                <div className='item-body'>
                                    {hydravlicTools?.length > 0 ? (
                                        hydravlicTools.filter(i =>
                                            !searchQuery ||
                                            'Гідравлічний'.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            i.typeOfStern?.toLowerCase().includes(searchQuery.toLowerCase())
                                        ).map((item) => (
                                            <div key={item.id} className='item-row hydravlic-tool-row tool-transfer-row' style={{ gridTemplateColumns: '0.1fr 1.5fr 0.5fr 0.8fr 1.5fr 1.5fr' }}>
                                                <input
                                                    type='checkbox'
                                                    className='transfer-checkbox'
                                                    checked={selectedHydravlicTools.includes(item.id)}
                                                    onChange={() => toggleHydravlicTool(item.id)}
                                                />
                                                <span title="Назва">{item.name}</span>
                                                <span title="Рік закупівлі">{item.yaerOfPurchase || '—'}</span>
                                                <span title="Тип приводу">{item.typeOfStern || '—'}</span>
                                                <span title="Місце зберігання">{item.placeOfStorage || '—'}</span>
                                                <span title="Примітки">{item.notes || '—'}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p>Частина такого обладнання поки немає</p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}

            {/* ── Спеціальне обладнання ── */}
            {(!searchQuery ||
                'Спеціальне обладнання'.toLowerCase().includes(searchQuery.toLowerCase()) ||
                specialTools.some(i =>
                    i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    i.quantity?.toString().includes(searchQuery.toLowerCase())
                )
            ) && (
                    <div className='transfer-wrapper'>
                        <SectionHeader sectionKey='specialTools' title='Спеціальне обладнання' />
                        {isOpen('specialTools') && (
                            <>
                                {specialTools?.length > 0 && (
                                    <div className='item-header-row tool-transfer-row' style={{ gridTemplateColumns: '0.1fr 1.5fr 0.5fr 1.5fr 1.5fr' }}>
                                        <span className='transfer-checkbox'></span>
                                        <span>назва обладнання</span>
                                        <span>кількість</span>
                                        <span>місце зберігання</span>
                                        <span>примітки</span>
                                    </div>
                                )}
                                <div className='item-body'>
                                    {specialTools?.length > 0 ? (
                                        specialTools.filter(i =>
                                            !searchQuery ||
                                            'Спеціальне обладнання'.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            i.quantity?.toString().includes(searchQuery.toLowerCase())
                                        ).map((item) => (
                                            <div key={item.id} className='item-row tool-transfer-row' style={{ gridTemplateColumns: '0.1fr 1.5fr 0.5fr 1.5fr 1.5fr' }}>
                                                <input
                                                    type='checkbox'
                                                    className='transfer-checkbox'
                                                    checked={selectedSpecialTools.includes(item.id)}
                                                    onChange={() => toggleSpecialTool(item.id)}
                                                />
                                                <span title="Назва">{item.name}</span>
                                                <span title="Кількість">{item.quantity ?? 0}</span>
                                                <span title="Місце зберігання">{item.placeOfStorage || '—'}</span>
                                                <span title="Примітки">{item.notes || '—'}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p>Частина такого обладнання поки немає</p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}

            {/* ── Ранцеві вогнегасники ── */}
            {(!searchQuery ||
                'Ранцеві вогнегасники'.toLowerCase().includes(searchQuery.toLowerCase()) ||
                backPackExtenguishers.some(i =>
                    i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    i.volumeOfWater?.toString().includes(searchQuery.toLowerCase())
                )
            ) && (
                    <div className='transfer-wrapper'>
                        <SectionHeader sectionKey='backPackExtenguishers' title='Ранцеві вогнегасники' />
                        {isOpen('backPackExtenguishers') && (
                            <>
                                {backPackExtenguishers?.length > 0 && (
                                    <div className='item-header-row tool-transfer-row' style={{ gridTemplateColumns: '0.1fr 1.5fr 0.5fr 1.5fr 1.5fr' }}>
                                        <span className='transfer-checkbox'></span>
                                        <span>назва</span>
                                        <span>кількість</span>
                                        <span>місце зберігання</span>
                                        <span>примітки</span>
                                    </div>
                                )}
                                <div className='item-body'>
                                    {backPackExtenguishers?.length > 0 ? (
                                        backPackExtenguishers.filter(i =>
                                            !searchQuery ||
                                            'Ранцеві вогнегасники'.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            i.volumeOfWater?.toString().includes(searchQuery.toLowerCase())
                                        ).map((item) => (
                                            <div key={item.id} className='item-row tool-transfer-row' style={{ gridTemplateColumns: '0.1fr 1.5fr 0.5fr 1.5fr 1.5fr' }}>
                                                <input
                                                    type='checkbox'
                                                    className='transfer-checkbox'
                                                    checked={selectedBackPackExtenguishers.includes(item.id)}
                                                    onChange={() => toggleBackPackExtenguisher(item.id)}
                                                />
                                                <span title="Назва">{item.name}</span>
                                                <span title="Кількість">{item.quantity ?? 0}</span>
                                                <span title="Місце зберігання">{item.placeOfStorage || '—'}</span>
                                                <span title="Примітки">{item.notes || '—'}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p>Частина такого обладнання поки немає</p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}

            {/* ── Засоби порятунку на воді ── */}
            {(!searchQuery || 'Засоби порятунку на воді'.toLowerCase().includes(searchQuery.toLowerCase())) && (
                    <div className='transfer-wrapper'>
                        <SectionHeader sectionKey='swimTools' title='Засоби порятунку на воді (введіть кількість для передачі)' />
                        {isOpen('swimTools') && (
                            <>
                                {swimTools?.length > 0 ? (
                                    <>
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
                                    </>
                                ) : (
                                    <div className='item-body'>
                                        <p>Частина такого обладнання поки немає</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

            {/* ── Бензопили / Пневматичний інструмент / Бензорізи (однаковий шаблон) ── */}
            {[
                { sectionKey: 'chainSaws', title: 'Бензопили', items: chainSaws, selected: selectedChainSaws, toggle: toggleChainSaw },
                { sectionKey: 'pneumaticTools', title: 'Пневматичний інструмент', items: pneumaticTools, selected: selectedPneumaticTools, toggle: togglePneumaticTool },
                { sectionKey: 'petrolCutters', title: 'Бензорізи', items: petrolCutters, selected: selectedPetrolCutters, toggle: togglePetrolCutter },
            ].map(({ sectionKey, title, items, selected, toggle }) => {
                const matchesSearch = !searchQuery ||
                    title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    items.some(i =>
                        i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        i.yearOfPurchase?.toString().includes(searchQuery.toLowerCase())
                    )
                if (!matchesSearch) return null
                return (
                    <div key={sectionKey} className='transfer-wrapper'>
                        <SectionHeader sectionKey={sectionKey} title={title} />
                        {isOpen(sectionKey) && (
                            <>
                                {items?.length > 0 && (
                                    <div className='item-header-row tool-transfer-row' style={{ gridTemplateColumns: '0.1fr 1.5fr 0.5fr 1.5fr 1.5fr' }}>
                                        <span className='transfer-checkbox'></span>
                                        <span>назва</span>
                                        <span>рік отримання</span>
                                        <span>місцезнаходження</span>
                                        <span>примітки</span>
                                    </div>
                                )}
                                <div className='item-body'>
                                    {items?.length > 0 ? (
                                        items.filter(i =>
                                            !searchQuery ||
                                            title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            i.yearOfPurchase?.toString().includes(searchQuery.toLowerCase())
                                        ).map((item) => (
                                            <div key={item.id} className='item-row tool-transfer-row' style={{ gridTemplateColumns: '0.1fr 1.5fr 0.5fr 1.5fr 1.5fr' }}>
                                                <input
                                                    type='checkbox'
                                                    className='transfer-checkbox'
                                                    checked={selected.includes(item.id)}
                                                    onChange={() => toggle(item.id)}
                                                />
                                                <span title='Назва'>{item.name}</span>
                                                <span title='Рік отримання'>{item.yearOfPurchase || '—'}</span>
                                                <span title='Місцезнаходження'>{item.placeOfStorage || '—'}</span>
                                                <span title='Примітки'>{item.notes || '—'}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p>Частина такого обладнання поки немає</p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )
            })}

            {/* ── Світлові мачти ── */}
            {(!searchQuery ||
                'Світлові мачти'.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lightMasts.some(i =>
                    i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    i.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    i.power?.toString().includes(searchQuery.toLowerCase())
                )
            ) && (
                <div className='transfer-wrapper'>
                    <SectionHeader sectionKey='lightMasts' title='Світлові мачти' />
                    {isOpen('lightMasts') && (
                        <>
                            {lightMasts?.length > 0 && (
                                <div className='item-header-row tool-transfer-row' style={{ gridTemplateColumns: '0.1fr 1.2fr 1fr 0.5fr 0.8fr 1.2fr 0.7fr' }}>
                                    <span className='transfer-checkbox'></span>
                                    <span>назва</span>
                                    <span>марка</span>
                                    <span>рік</span>
                                    <span>потужність (Вт)</span>
                                    <span>місцезнаходження</span>
                                    <span>подовжувачі</span>
                                </div>
                            )}
                            <div className='item-body'>
                                {lightMasts?.length > 0 ? (
                                    lightMasts.filter(i =>
                                        !searchQuery ||
                                        'Світлові мачти'.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        i.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        i.power?.toString().includes(searchQuery.toLowerCase())
                                    ).map((item) => (
                                        <div key={item.id} className='item-row tool-transfer-row' style={{ gridTemplateColumns: '0.1fr 1.2fr 1fr 0.5fr 0.8fr 1.2fr 0.7fr' }}>
                                            <input
                                                type='checkbox'
                                                className='transfer-checkbox'
                                                checked={selectedLightMasts.includes(item.id)}
                                                onChange={() => toggleLightMast(item.id)}
                                            />
                                            <span title='Назва'>{item.name}</span>
                                            <span title='Марка'>{item.brand || '—'}</span>
                                            <span title='Рік'>{item.yearOfPurchase || '—'}</span>
                                            <span title='Потужність (Вт)'>{item.power || '—'}</span>
                                            <span title='Місцезнаходження'>{item.placeOfStorage || '—'}</span>
                                            <span title='Подовжувачі'>{item.extensionCordsCount ?? '—'}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p>Частина такого обладнання поки немає</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default Transfercomponent
