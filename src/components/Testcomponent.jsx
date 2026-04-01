import React, { useState } from 'react';
import { fetchTestItemsByBrigade, fetchTestLinksByBrigade, updateTestLinks } from '../api/services.js';
import useApi from '../hooks/useApi.js';
import LoadingSpinner from './ui/LoadingSpinner.jsx';
import ErrorMessage from './ui/ErrorMessage.jsx';
import ItemTest from './ItemTest';
import Testorderschedulelinks from './Testorderschedulelinks';
import { MdOutlinePublishedWithChanges } from "react-icons/md";
import SearchBar from './ui/SearchBar.jsx';
import '../scss/testcomponent.scss'

const Testcomponent = ({ selectedBrigade }) => {
    const [showLinksModal, setShowLinksModal] = useState(false)
    const [linksFormData, setLinksFormData] = useState({ linkSchedule: '', linkOrder: '' })
    const [searchQuery, setSearchQuery] = useState('')

    const {
        data: testLists,
        loading,
        error,
        refetch
    } = useApi(
        () => fetchTestItemsByBrigade(selectedBrigade),
        [selectedBrigade],
        { skip: !selectedBrigade }
    );

    const { data: testLinks, refetch: refetchLinks } = useApi(
        () => fetchTestLinksByBrigade(selectedBrigade),
        [selectedBrigade],
        { skip: !selectedBrigade }
    );

    // Sync form data when links load
    React.useEffect(() => {
        if (testLinks) {
            setLinksFormData({
                linkSchedule: testLinks.linkSchedule || '',
                linkOrder: testLinks.linkOrder || ''
            });
        }
    }, [testLinks]);

    const handleLinksSubmit = async (e) => {
        e.preventDefault()
        try {
            await updateTestLinks(selectedBrigade, linksFormData);
            setShowLinksModal(false);
            refetchLinks();
        } catch (err) {
            console.error('Failed to update links:', err)
        }
    }

    if (!selectedBrigade) {
        return <p>Оберіть ідрозділ</p>
    }

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} onRetry={refetch} />;

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

            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Пошук за назвою списку випробувань..." />

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

            {(testLists || []).filter(list =>
                !searchQuery ||
                list.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                list.TestItems?.some(i => i.name?.toLowerCase().includes(searchQuery.toLowerCase()))
            ).map((list) => (
                <ItemTest key={list.id} testList={list} selectedBrigade={selectedBrigade} onItemCreated={refetch} searchQuery={searchQuery} />
            ))}
        </div>
    );
};

export default Testcomponent;
