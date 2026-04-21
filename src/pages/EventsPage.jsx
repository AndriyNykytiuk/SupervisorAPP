import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext.jsx'
import useApi from '../hooks/useApi.js'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
import ErrorMessage from '../components/ui/ErrorMessage.jsx'
import AddTeamModal from '../components/AddTeamModal.jsx'
import {
    fetchFireEvents,
    closeFireEvent,
    deleteFireEvent,
    removeEventTeam,
} from '../api/services.js'
import '../scss/fireevents.scss'

const fmtDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

const EventsPage = () => {
    const { user } = useAuth()
    const isGod = user?.role === 'GOD'
    const { data: events, loading, error, refetch } = useApi(() => fetchFireEvents(), [])

    const [tab, setTab] = useState('open') // 'open' | 'closed'
    const [addTeamFor, setAddTeamFor] = useState(null) // eventId or null
    const [editTeam, setEditTeam] = useState(null) // {team, eventId}

    const filtered = (events || []).filter((e) => e.status === tab)

    const handleClose = async (ev) => {
        if (!confirm(`Закрити подію "${ev.name}"? Редагування буде заблоковане.`)) return
        try {
            await closeFireEvent(ev.id)
            toast.success('Подію закрито')
            refetch()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка')
        }
    }

    const handleDelete = async (ev) => {
        if (!confirm(`Видалити подію "${ev.name}" назавжди разом з командами та історією?`)) return
        try {
            await deleteFireEvent(ev.id)
            toast.success('Подію видалено')
            refetch()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка')
        }
    }

    const handleRemoveTeam = async (team) => {
        if (!confirm(`Видалити команду "${team.Brigade?.name || ''}"?`)) return
        try {
            await removeEventTeam(team.id)
            toast.success('Команду видалено')
            refetch()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка')
        }
    }

    if (loading) return <LoadingSpinner />
    if (error) return <ErrorMessage message={error} onRetry={refetch} />

    return (
        <div className="fe-page">
            <div className="fe-page-header">
                <h2>Події (пожежі)</h2>
                <Link to="/events/history" className="fe-btn fe-btn-secondary">
                    Історія дій
                </Link>
            </div>

            <div className="fe-tabs">
                <button
                    className={`fe-tab ${tab === 'open' ? 'active' : ''}`}
                    onClick={() => setTab('open')}
                >
                    Активні ({(events || []).filter((e) => e.status === 'open').length})
                </button>
                <button
                    className={`fe-tab ${tab === 'closed' ? 'active' : ''}`}
                    onClick={() => setTab('closed')}
                >
                    Архів ({(events || []).filter((e) => e.status === 'closed').length})
                </button>
            </div>

            {filtered.length === 0 && (
                <p className="fe-muted">Немає подій у цій категорії</p>
            )}

            <div className="fe-events-list">
                {filtered.map((ev) => {
                    const totalPeople = (ev.EventTeams || []).reduce(
                        (sum, t) => sum + (t.peopleCount || 0),
                        0
                    )
                    return (
                        <article key={ev.id} className={`fe-event-card status-${ev.status}`}>
                            <header className="fe-event-header">
                                <div>
                                    <h3>{ev.name}</h3>
                                    <p className="fe-event-meta">
                                        {ev.address || '—'} · {fmtDate(ev.startTime)}
                                        {ev.endTime && <> → {fmtDate(ev.endTime)}</>}
                                    </p>
                                    {ev.description && <p className="fe-event-desc">{ev.description}</p>}
                                    {(ev.latitude && ev.longitude) && (
                                        <p className="fe-event-coords">
                                            GPS: {ev.latitude}, {ev.longitude}
                                        </p>
                                    )}
                                </div>
                                <div className="fe-event-actions">
                                    <span className="fe-stat">
                                        <strong>{(ev.EventTeams || []).length}</strong> команд
                                    </span>
                                    <span className="fe-stat">
                                        <strong>{totalPeople}</strong> осіб
                                    </span>
                                    {isGod && ev.status === 'open' && (
                                        <>
                                            <button
                                                className="fe-btn fe-btn-primary fe-btn-sm"
                                                onClick={() => setAddTeamFor(ev.id)}
                                            >
                                                + Команда
                                            </button>
                                            <button
                                                className="fe-btn fe-btn-warning fe-btn-sm"
                                                onClick={() => handleClose(ev)}
                                            >
                                                Закрити
                                            </button>
                                        </>
                                    )}
                                    {isGod && (
                                        <button
                                            className="fe-btn fe-btn-danger fe-btn-sm"
                                            onClick={() => handleDelete(ev)}
                                        >
                                            Видалити
                                        </button>
                                    )}
                                    <Link
                                        to={`/events/${ev.id}/history`}
                                        className="fe-btn fe-btn-secondary fe-btn-sm"
                                    >
                                        Історія
                                    </Link>
                                </div>
                            </header>

                            {(ev.EventTeams || []).length > 0 && (
                                <div className="fe-teams-grid">
                                    {ev.EventTeams.map((team) => (
                                        <div key={team.id} className="fe-team-card">
                                            <div className="fe-team-top">
                                                <strong>{team.Brigade?.name || '—'}</strong>
                                                {team.locationName && (
                                                    <span className="fe-team-loc">📍 {team.locationName}</span>
                                                )}
                                            </div>
                                            <dl className="fe-team-details">
                                                <dt>Старша особа:</dt>
                                                <dd>
                                                    {team.SeniorUser?.name || team.seniorNameText || '—'}
                                                </dd>
                                                <dt>Людей:</dt>
                                                <dd>{team.peopleCount}</dd>
                                                {team.vehicles && (
                                                    <>
                                                        <dt>Техніка:</dt>
                                                        <dd>{team.vehicles}</dd>
                                                    </>
                                                )}
                                                {team.fuel && (
                                                    <>
                                                        <dt>ПММ:</dt>
                                                        <dd>{team.fuel}</dd>
                                                    </>
                                                )}
                                                {team.notes && (
                                                    <>
                                                        <dt>Нотатки:</dt>
                                                        <dd>{team.notes}</dd>
                                                    </>
                                                )}
                                            </dl>
                                            {Array.isArray(team.equipment) && team.equipment.length > 0 && (
                                                <div className="fe-team-eq">
                                                    <em>Обладнання:</em>
                                                    <ul>
                                                        {team.equipment.map((eq) => (
                                                            <li key={eq.id}>
                                                                <span className="fe-team-eq-cat">{eq.category}</span>
                                                                {eq.name} × {eq.quantity}
                                                                {eq.brigadeName && (
                                                                    <small> ({eq.brigadeName})</small>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {isGod && ev.status === 'open' && (
                                                <div className="fe-team-actions">
                                                    <button
                                                        className="fe-btn fe-btn-secondary fe-btn-sm"
                                                        onClick={() => setEditTeam({ team, eventId: ev.id })}
                                                    >
                                                        Редагувати
                                                    </button>
                                                    <button
                                                        className="fe-btn fe-btn-danger fe-btn-sm"
                                                        onClick={() => handleRemoveTeam(team)}
                                                    >
                                                        Видалити
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </article>
                    )
                })}
            </div>

            <AddTeamModal
                isOpen={!!addTeamFor}
                eventId={addTeamFor}
                onClose={() => setAddTeamFor(null)}
                onSaved={() => refetch()}
            />
            <AddTeamModal
                isOpen={!!editTeam}
                eventId={editTeam?.eventId}
                team={editTeam?.team}
                onClose={() => setEditTeam(null)}
                onSaved={() => refetch()}
            />
        </div>
    )
}

export default EventsPage
