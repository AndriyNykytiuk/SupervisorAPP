import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'react-toastify'
import { MdAttachFile, MdClose } from 'react-icons/md'
import { uploadEquipmentDocument } from '../api/services.js'
import '../scss/documentuploader.scss'

const DocumentUploader = ({ equipmentType, equipmentId, brigadeId, canEdit = true, onUploaded }) => {
    const [expanded, setExpanded] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [docName, setDocName] = useState('')
    const fileInputRef = useRef(null)

    useEffect(() => {
        if (expanded) {
            setDocName('')
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }, [expanded])

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
            onUploaded?.(doc)
            setExpanded(false)
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка завантаження')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className='doc-uploader'>
            <button
                type='button'
                className='doc-toggle'
                onClick={(e) => { e.stopPropagation(); setExpanded((s) => !s) }}
            >
                
                <span>Прикріпити документ</span>
            </button>

            {expanded && createPortal(
                <div className='doc-modal-overlay' onClick={() => setExpanded(false)}>
                <div className='doc-panel doc-panel-modal' onClick={(e) => e.stopPropagation()}>
                    <div className='doc-panel-header'>
                        <strong>Прикріпити документ (PDF)</strong>
                        <button type='button' className='doc-close' onClick={() => setExpanded(false)}>
                            <MdClose />
                        </button>
                    </div>

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
                                    onClick={() => setExpanded(false)}
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
