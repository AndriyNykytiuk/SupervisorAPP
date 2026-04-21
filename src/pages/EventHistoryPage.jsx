import React from 'react'
import { Link, useParams } from 'react-router-dom'
import useApi from '../hooks/useApi.js'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
import ErrorMessage from '../components/ui/ErrorMessage.jsx'
import {
    fetchAllFireEventHistory,
    fetchFireEventHistory,
    fetchFireEvent,
} from '../api/services.js'
import '../scss/fireevents.scss'

const ACTION_LABELS = {
    event_created: { text: 'Створено подію', color: '#2563eb' },
    event_updated: { text: 'Оновлено подію', color: '#0891b2' },
    event_closed: { text: 'Закрито подію', color: '#dc2626' },
    team_added: { text: 'Додано команду', color: '#16a34a' },
    team_removed: { text: 'Видалено команду', color: '#dc2626' },
    team_count_changed: { text: 'Змінено кількість людей', color: '#d97706' },
    team_updated: { text: 'Оновлено команду', color: '#0891b2' },
}

const fmtDate = (d) =>
    new Date(d).toLocaleString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })

const renderDetails = (action, details) => {
    if (!details) return null
    switch (action) {
        case 'event_created':
            return `${details.name}${details.address ? ` · ${details.address}` : ''}`
        case 'team_added':
            return `${details.brigadeName || ''}${details.locationName ? ` · ${details.locationName}` : ''} · ${details.peopleCount ?? 0} ос.`
        case 'team_removed':
            return `${details.brigadeName || ''}${details.locationName ? ` · ${details.locationName}` : ''}`
        case 'team_count_changed':
            return `${details.oldCount} → ${details.newCount}`
        default:
            return null
    }
}

const EventHistoryPage = () => {
    const { eventId } = useParams()
    const scoped = !!eventId

    const { data: history, loading, error, refetch } = useApi(
        () => (scoped ? fetchFireEventHistory(eventId) : fetchAllFireEventHistory()),
        [eventId]
    )

    const { data: event } = useApi(
        () => fetchFireEvent(eventId),
        [eventId],
        { skip: !scoped }
    )

    if (loading) return <LoadingSpinner />
    if (error) return <ErrorMessage message={error} onRetry={refetch} />

    return (
        <div className="fe-page">
            <div className="fe-page-header">
                <div>
                    <Link to="/events" className="fe-back-link">← До списку подій</Link>
                    <h2>
                        {scoped ? `Історія події: ${event?.name || ''}` : 'Історія всіх дій'}
                    </h2>
                </div>
            </div>

            {(history || []).length === 0 && (
                <p className="fe-muted">Поки що немає записів</p>
            )}

            <ol className="fe-history-list">
                {(history || []).map((h) => {
                    const info = ACTION_LABELS[h.action] || { text: h.action, color: '#64748b' }
                    const detail = renderDetails(h.action, h.details)
                    return (
                        <li key={h.id} className="fe-history-item">
                            <div className="fe-history-dot" style={{ backgroundColor: info.color }} />
                            <div className="fe-history-body">
                                <div className="fe-history-top">
                                    <span className="fe-history-action" style={{ color: info.color }}>
                                        {info.text}
                                    </span>
                                    <span className="fe-history-date">{fmtDate(h.createdAt)}</span>
                                </div>
                                <div className="fe-history-meta">
                                    <span>{h.userName || 'Система'}</span>
                                    {!scoped && h.FireEvent && (
                                        <Link to={`/events/${h.FireEvent.id}/history`}>
                                            {h.FireEvent.name}
                                        </Link>
                                    )}
                                </div>
                                {detail && <div className="fe-history-detail">{detail}</div>}
                            </div>
                        </li>
                    )
                })}
            </ol>
        </div>
    )
}

export default EventHistoryPage
