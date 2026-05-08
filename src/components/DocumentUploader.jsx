import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'react-toastify'
import { MdAttachFile, MdDelete, MdDownload, MdClose } from 'react-icons/md'
import {
    fetchEquipmentDocuments,
    uploadEquipmentDocument,
    downloadEquipmentDocumentUrl,
    deleteEquipmentDocument,
} from '../api/services.js'
import '../scss/documentuploader.scss'

const fmtSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const fmtDate = (d) => new Date(d).toLocaleDateString('uk-UA', {
    day: '2-digit', month: '2-digit', year: 'numeric',
})

const DocumentUploader = ({ equipmentType, equipmentId, brigadeId, canEdit = true, onUploaded }) => {
    const [docs, setDocs] = useState([])
    const [loading, setLoading] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [docName, setDocName] = useState('')
    const fileInputRef = useRef(null)

    const fetchData = async () => {
        if (!equipmentType || !equipmentId) return
        setLoading(true)
        try {
            const data = await fetchEquipmentDocuments({ equipmentType, equipmentId })
            setDocs(data || [])
        } catch (err) {
            console.error('Failed to fetch documents:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (expanded) fetchData()
    }, [expanded, equipmentType, equipmentId])

    const handleUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.type !== 'application/pdf') {
            toast.error('Тільки PDF')
            e.target.value = ''
            return
        }
        if (file.size > 20 * 1024 * 1024) {
            toast.error('Файл більше 20MB')
            e.target.value = ''
            return
        }

        setUploading(true)
        try {
            const doc = await uploadEquipmentDocument({
                equipmentType,
                equipmentId,
                brigadeId,
                documentName: docName.trim() || file.name,
                file,
            })
            toast.success('Документ завантажено')
            setDocName('')
            e.target.value = ''
            fetchData()
            onUploaded?.(doc)
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка завантаження')
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (doc) => {
        if (!confirm(`Видалити документ "${doc.documentName}"?`)) return
        try {
            await deleteEquipmentDocument(doc.id)
            toast.success('Видалено')
            fetchData()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка видалення')
        }
    }

    return (
        <div className='doc-uploader'>
            <button
                type='button'
                className='doc-toggle'
                onClick={(e) => { e.stopPropagation(); setExpanded((s) => !s) }}
            >
                
                <span>Прикріпити документ{docs.length > 0 && expanded ? ` (${docs.length})` : ''}</span>
            </button>

            {expanded && createPortal(
                <div className='doc-modal-overlay' onClick={() => setExpanded(false)}>
                <div className='doc-panel doc-panel-modal' onClick={(e) => e.stopPropagation()}>
                    <div className='doc-panel-header'>
                        <strong>Акти / протоколи (PDF)</strong>
                        <button type='button' className='doc-close' onClick={() => setExpanded(false)}>
                            <MdClose />
                        </button>
                    </div>

                    {loading ? (
                        <p className='doc-muted'>Завантаження...</p>
                    ) : docs.length === 0 ? (
                        <p className='doc-muted'>Документів немає</p>
                    ) : (
                        <ul className='doc-list'>
                            {docs.map((d) => (
                                <li key={d.id} className='doc-item'>
                                    <div className='doc-info'>
                                        <span className='doc-name'>{d.documentName}</span>
                                        <span className='doc-meta'>
                                            {fmtSize(d.size)} · {fmtDate(d.createdAt)}
                                            {d.uploadedByUserName && ` · ${d.uploadedByUserName}`}
                                        </span>
                                    </div>
                                    <div className='doc-actions'>
                                        <a
                                            href={downloadEquipmentDocumentUrl(d.id)}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='doc-btn doc-btn-download'
                                            title='Відкрити'
                                        >
                                            <MdDownload />
                                        </a>
                                        {canEdit && (
                                            <button
                                                type='button'
                                                className='doc-btn doc-btn-delete'
                                                onClick={() => handleDelete(d)}
                                                title='Видалити'
                                            >
                                                <MdDelete />
                                            </button>
                                        )}
                                    </div>
                                </li>
                                
                            ))}
                        </ul>
                        
                    )}

                    {canEdit && (
                        <div>
                            <div className='doc-upload-row'>
                                <input
                                    type='text'
                                    placeholder='Назва документа (необовʼязково)'
                                    value={docName}
                                    onChange={(e) => setDocName(e.target.value)}
                                    disabled={uploading}
                                    className='doc-name-input'
                                />
                                <input
                                    ref={fileInputRef}
                                    type='file'
                                    accept='application/pdf'
                                    onChange={handleUpload}
                                    disabled={uploading}
                                    style={{ display: 'none' }}
                                />
                                <button
                                    type='button'
                                    className='doc-upload-btn'
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                >
                                    {uploading ? 'Завантаження...' : 'вибрати документ'}
                                </button>
                            
                            </div>
                            <div className='doc-attach-row'>
                                <button
                                    type='button'
                                    className='doc-attach-btn'
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                >
                                    <MdAttachFile />
                                    <span>прикріпити документ</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                </div>,
                document.body
            )}
        </div>
    )
}

export default DocumentUploader
