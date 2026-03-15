import React, { useState, useEffect } from 'react';
import ItemTest from './ItemTest';
import Testorderschedulelinks from './Testorderschedulelinks';
import { MdOutlinePublishedWithChanges } from "react-icons/md";
import '../scss/testcomponent.scss'

const Testcomponent = ({ selectedBrigade }) => {
    const [testLists, setTestLists] = useState([])
    const [testLinks, setTestLinks] = useState(null)
    const [showLinksModal, setShowLinksModal] = useState(false)
    const [linksFormData, setLinksFormData] = useState({ linkSchedule: '', linkOrder: '' })

    const fetchData = async () => {
        if (!selectedBrigade) return
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/test-items/brigade/${selectedBrigade}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            setTestLists(data)

            const resLinks = await fetch(`/api/test-links/brigade/${selectedBrigade}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const dataLinks = await resLinks.json()
            setTestLinks(dataLinks)
            setLinksFormData({
                linkSchedule: dataLinks.linkSchedule || '',
                linkOrder: dataLinks.linkOrder || ''
            })
        } catch (err) {
            console.error('Failed to fetch test items/links:', err)
        }
    }

    const handleLinksSubmit = async (e) => {
        e.preventDefault()
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/test-links/brigade/${selectedBrigade}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(linksFormData),
            })
            if (res.ok) {
                setShowLinksModal(false)
                fetchData()
            }
        } catch (err) {
            console.error('Failed to update links:', err)
        }
    }

    useEffect(() => {
        fetchData()
    }, [selectedBrigade])

    if (!selectedBrigade) {
        return <p>Оберіть бригаду</p>
    }

    return (
        <div>
            <div className='testcomponent-header'>
                <h2>Випробування ПТО </h2>
                <div className='btn-box'>
                    <Testorderschedulelinks links={testLinks} />

                    <MdOutlinePublishedWithChanges onClick={() => setShowLinksModal(true)}
                        className="edit-button" />

                </div>
            </div>

            {showLinksModal && (
                <div className='modal-overlay' onClick={() => setShowLinksModal(false)}>
                    <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Оновити посилання</h3>
                            <button className="close-btn" onClick={() => setShowLinksModal(false)}>✕</button>
                        </div>
                        <form className='add-form' onSubmit={handleLinksSubmit}>
                            <label>Графік випробувань:</label>
                            <input
                                type='url'
                                value={linksFormData.linkSchedule}
                                onChange={(e) => setLinksFormData({ ...linksFormData, linkSchedule: e.target.value })}
                                placeholder='Посилання на графік'
                            />

                            <label>Наказ на випробування:</label>
                            <input
                                type='url'
                                value={linksFormData.linkOrder}
                                onChange={(e) => setLinksFormData({ ...linksFormData, linkOrder: e.target.value })}
                                placeholder='Посилання на наказ'
                            />

                            <button type='submit'>Зберегти</button>
                        </form>
                    </div>
                </div>
            )}

            {testLists.map((list) => (
                <ItemTest key={list.id} testList={list} selectedBrigade={selectedBrigade} onItemCreated={fetchData} />
            ))}
        </div>
    );
};

export default Testcomponent;
