import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { fetchTestItemsByBrigade, fetchTestLinksByBrigade, updateTestLinks, uploadEquipmentDocument } from '../api/services.js';
import useApi from '../hooks/useApi.js';
import LoadingSpinner from './ui/LoadingSpinner.jsx';
import ErrorMessage from './ui/ErrorMessage.jsx';
import ItemTest from './ItemTest';
import FireExtenguisher from './FireExtenguisher.jsx';
import Testorderschedulelinks from './Testorderschedulelinks';
import { MdOutlinePublishedWithChanges } from "react-icons/md";
import SearchBar from './ui/SearchBar.jsx';
import '../scss/testcomponent.scss'

const Testcomponent = ({ selectedBrigade }) => {
    const [showLinksModal, setShowLinksModal] = useState(false)
    const [linksFormData, setLinksFormData] = useState({ linkSchedule: '', linkOrder: '' })
    const [searchQuery, setSearchQuery] = useState('')
    const [uploadingField, setUploadingField] = useState(null) // 'linkSchedule' | 'linkOrder' | null
    const scheduleFileRef = useRef(null)
    const orderFileRef = useRef(null)

    const handlePdfUpload = async (field, equipmentType, e) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.type !== 'application/pdf') { toast.error('Тільки PDF'); e.target.value = ''; return }
        if (file.size > 20 * 1024 * 1024) { toast.error('Файл більше 20MB'); e.target.value = ''; return }

        setUploadingField(field)
        try {
            const doc = await uploadEquipmentDocument({
                equipmentType,
                equipmentId: selectedBrigade,
                brigadeId: selectedBrigade,
                documentName: equipmentType === 'TestSchedule' ? 'Графік випробувань' : 'Наказ на випробування',
                file,
            })
            setLinksFormData((prev) => ({ ...prev, [field]: `/api/equipment-documents/${doc.id}/download` }))
            toast.success('PDF завантажено — натисніть Зберегти')
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка завантаження')
        } finally {
            setUploadingField(null)
            e.target.value = ''
        }
    }

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
                                type='text'
                                value={linksFormData.linkSchedule}
                                onChange={(e) => setLinksFormData({ ...linksFormData, linkSchedule: e.target.value })}
                                placeholder='Посилання або завантажте PDF'
                            />
                            <input ref={scheduleFileRef} type='file' accept='application/pdf' style={{ display: 'none' }} onChange={(e) => handlePdfUpload('linkSchedule', 'TestSchedule', e)} />
                            <button
                                type='button'
                                onClick={() => scheduleFileRef.current?.click()}
                                disabled={uploadingField !== null}
                                style={{ marginBottom: '0.75rem', backgroundColor: 'var(--navy)', color: '#fff', border: 'none', padding: '0.45rem 0.85rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
                            >
                                {uploadingField === 'linkSchedule' ? 'Завантаження...' : '+ PDF графік'}
                            </button>

                            <label>Наказ на випробування:</label>
                            <input
                                type='text'
                                value={linksFormData.linkOrder}
                                onChange={(e) => setLinksFormData({ ...linksFormData, linkOrder: e.target.value })}
                                placeholder='Посилання або завантажте PDF'
                            />
                            <input ref={orderFileRef} type='file' accept='application/pdf' style={{ display: 'none' }} onChange={(e) => handlePdfUpload('linkOrder', 'TestOrder', e)} />
                            <button
                                type='button'
                                onClick={() => orderFileRef.current?.click()}
                                disabled={uploadingField !== null}
                                style={{ marginBottom: '0.75rem', backgroundColor: 'var(--navy)', color: '#fff', border: 'none', padding: '0.45rem 0.85rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
                            >
                                {uploadingField === 'linkOrder' ? 'Завантаження...' : '+ PDF наказ'}
                            </button>

                            <button type='submit'>Зберегти</button>
                        </form>
                    </div>
                </div>
            )}

            {(testLists || []).filter(list =>
                !searchQuery ||
                list.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                list.TestItems?.some(i => i.name?.toLowerCase().includes(searchQuery.toLowerCase()))
            ).sort((a, b) => a.id - b.id).map((list) => (
                <ItemTest key={list.id} testList={list} selectedBrigade={selectedBrigade} onItemCreated={refetch} searchQuery={searchQuery} />
            ))}

            <FireExtenguisher selectedBrigade={selectedBrigade} searchQuery={searchQuery} />
        </div>
    );
};

export default Testcomponent;
