import React from 'react'
import { toast } from 'react-toastify'
import { openInternalDocumentLink } from '../api/services.js'
import '../scss/testorderschedulecomponent.scss'

const isInternal = (link) => /^\/api\/equipment-documents\/\d+\/download/.test(link || '')

const open = (link) => {
    if (!link) return
    if (isInternal(link)) {
        openInternalDocumentLink(link).catch(() => toast.error('Не вдалося відкрити документ'))
    } else {
        window.open(link, '_blank', 'noopener,noreferrer')
    }
}

const Testorderschedulelinks = ({ links }) => {
    return (
        <div className='paper-wrap'>
            <div>
                <button
                    type='button'
                    onClick={() => open(links?.linkSchedule)}
                    disabled={!links?.linkSchedule}
                    style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: links?.linkSchedule ? 'pointer' : 'not-allowed', color: links?.linkSchedule ? 'inherit' : '#94a3b8', textDecoration: links?.linkSchedule ? 'underline' : 'none' }}
                >
                    Графік випробувань
                </button>
            </div>
            <div>
                <button
                    type='button'
                    onClick={() => open(links?.linkOrder)}
                    disabled={!links?.linkOrder}
                    style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: links?.linkOrder ? 'pointer' : 'not-allowed', color: links?.linkOrder ? 'inherit' : '#94a3b8', textDecoration: links?.linkOrder ? 'underline' : 'none' }}
                >
                    Наказ на Випробування
                </button>
            </div>
        </div>
    )
}

export default Testorderschedulelinks
