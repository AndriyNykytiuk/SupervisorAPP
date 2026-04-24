import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext.jsx'
import useApi from '../hooks/useApi.js'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
import ErrorMessage from '../components/ui/ErrorMessage.jsx'
import CreateSurveyModal from '../components/CreateSurveyModal.jsx'
import {
    fetchSurveys,
    closeSurvey,
    deleteSurvey,
} from '../api/services.js'
import '../scss/surveys.scss'

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

const SurveysPage = () => {
    const { user } = useAuth()
    const isGod = user?.role === 'GOD'
    const hasBrigade = Boolean(user?.brigadeId)

    const { data: surveys, loading, error, refetch } = useApi(() => fetchSurveys(), [])
    const [tab, setTab] = useState('open')
    const [createOpen, setCreateOpen] = useState(false)

    const list = surveys || []
    const openCount = list.filter((s) => s.status === 'open').length
    const closedCount = list.filter((s) => s.status === 'closed').length
    const visible = isGod ? list.filter((s) => s.status === tab) : list

    const handleClose = async (s) => {
        if (!confirm(`Закрити форму "${s.title}"? Після цього редагування недоступне.`)) return
        try {
            await closeSurvey(s.id)
            toast.success('Форму закрито')
            refetch()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка')
        }
    }

    const handleDelete = async (s) => {
        if (!confirm(`Видалити форму "${s.title}" назавжди разом з усіма відповідями?`)) return
        try {
            await deleteSurvey(s.id)
            toast.success('Форму видалено')
            refetch()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка')
        }
    }

    if (loading) return <LoadingSpinner />
    if (error) return <ErrorMessage message={error} onRetry={refetch} />

    return (
        <div className="sv-page">
            <div className="sv-page-header">
                <h2>Форми збору інформації</h2>
                {isGod && (
                    <button
                        className="sv-btn sv-btn-primary"
                        onClick={() => setCreateOpen(true)}
                    >
                        + Нова форма
                    </button>
                )}
            </div>

            {isGod && (
                <div className="sv-tabs">
                    <button
                        className={`sv-tab ${tab === 'open' ? 'active' : ''}`}
                        onClick={() => setTab('open')}
                    >
                        Активні ({openCount})
                    </button>
                    <button
                        className={`sv-tab ${tab === 'closed' ? 'active' : ''}`}
                        onClick={() => setTab('closed')}
                    >
                        Архів ({closedCount})
                    </button>
                </div>
            )}

            {visible.length === 0 && (
                <p className="sv-muted">
                    {isGod
                        ? 'Немає форм у цій категорії'
                        : 'Наразі активних форм немає'}
                </p>
            )}

            <div className="sv-list">
                {visible.map((s) => {
                    const answered = Boolean(s.myResponseId)
                    const overdue =
                        s.status === 'open' &&
                        s.deadline &&
                        new Date(s.deadline).getTime() < Date.now()
                    const questionCount = Array.isArray(s.questions) ? s.questions.length : 0

                    return (
                        <article
                            key={s.id}
                            className={`sv-card status-${s.status} ${answered ? 'answered' : ''}`}
                        >
                            <div className="sv-card-header">
                                <div>
                                    <h3>{s.title}</h3>
                                    <p className="sv-card-meta">
                                        {questionCount} {questionCount === 1 ? 'питання' : 'питань'}
                                        {' · '}
                                        Створено: {fmtDate(s.createdAt)}
                                        {s.deadline && (
                                            <>
                                                {' · '}
                                                Подати до: {fmtDate(s.deadline)}
                                            </>
                                        )}
                                    </p>
                                    {s.description && (
                                        <p className="sv-card-desc">{s.description}</p>
                                    )}
                                </div>
                                <div className="sv-card-actions">
                                    {s.status === 'closed' && (
                                        <span className="sv-badge sv-badge-closed">Закрита</span>
                                    )}
                                    {overdue && (
                                        <span className="sv-badge sv-badge-overdue">
                                            Прострочено
                                        </span>
                                    )}
                                    {!isGod && hasBrigade && s.status === 'open' && (
                                        <span
                                            className={`sv-badge ${
                                                answered
                                                    ? 'sv-badge-done'
                                                    : 'sv-badge-pending'
                                            }`}
                                        >
                                            {answered ? '✓ Заповнено' : 'Не заповнено'}
                                        </span>
                                    )}
                                    {isGod && (
                                        <span className="sv-badge sv-badge-count">
                                            {s.responseCount || 0} відповідей
                                        </span>
                                    )}

                                    <Link
                                        to={`/surveys/${s.id}`}
                                        className="sv-btn sv-btn-secondary sv-btn-sm"
                                    >
                                        {isGod ? 'Переглянути' : 'Відкрити'}
                                    </Link>

                                    {isGod && s.status === 'open' && (
                                        <button
                                            className="sv-btn sv-btn-warning sv-btn-sm"
                                            onClick={() => handleClose(s)}
                                        >
                                            Закрити
                                        </button>
                                    )}
                                    {isGod && (
                                        <button
                                            className="sv-btn sv-btn-danger sv-btn-sm"
                                            onClick={() => handleDelete(s)}
                                        >
                                            Видалити
                                        </button>
                                    )}
                                </div>
                            </div>
                        </article>
                    )
                })}
            </div>

            <CreateSurveyModal
                isOpen={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreated={() => refetch()}
            />
        </div>
    )
}

export default SurveysPage
