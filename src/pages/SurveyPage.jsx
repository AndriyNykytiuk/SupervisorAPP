import React, { useState, useEffect, useMemo } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext.jsx'
import useApi from '../hooks/useApi.js'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
import ErrorMessage from '../components/ui/ErrorMessage.jsx'
import {
    fetchSurvey,
    fetchSurveyResponses,
    fetchSurveyAggregate,
    upsertSurveyResponse,
    closeSurvey,
    deleteSurvey,
    downloadSurveyCsv,
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

const SurveyPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const isGod = user?.role === 'GOD'

    const {
        data: survey,
        loading,
        error,
        refetch,
    } = useApi(() => fetchSurvey(id), [id])

    if (loading) return <LoadingSpinner />
    if (error) return <ErrorMessage message={error} onRetry={refetch} />
    if (!survey) return null

    return (
        <div className="sv-page">
            <Link to="/surveys" className="sv-back-link">← До списку форм</Link>
            <div className="sv-page-header">
                <div>
                    <h2>{survey.title}</h2>
                    <p className="sv-card-meta">
                        Створено: {fmtDate(survey.createdAt)}
                        {survey.createdByUserName && <> · {survey.createdByUserName}</>}
                        {survey.deadline && <> · Дедлайн: {fmtDate(survey.deadline)}</>}
                        {survey.status === 'closed' && (
                            <> · <span className="sv-badge sv-badge-closed">Закрита</span></>
                        )}
                    </p>
                    {survey.description && (
                        <p className="sv-card-desc">{survey.description}</p>
                    )}
                </div>
                {isGod && (
                    <GodActions
                        survey={survey}
                        onRefetch={refetch}
                        onDeleted={() => navigate('/surveys')}
                    />
                )}
            </div>

            {isGod ? (
                <GodDashboard surveyId={survey.id} questions={survey.questions || []} />
            ) : (
                <RwFillForm survey={survey} onSaved={refetch} />
            )}
        </div>
    )
}

const GodActions = ({ survey, onRefetch, onDeleted }) => {
    const [exporting, setExporting] = useState(false)

    const handleClose = async () => {
        if (!confirm(`Закрити форму "${survey.title}"?`)) return
        try {
            await closeSurvey(survey.id)
            toast.success('Форму закрито')
            onRefetch()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка')
        }
    }
    const handleDelete = async () => {
        if (!confirm(`Видалити форму "${survey.title}" назавжди?`)) return
        try {
            await deleteSurvey(survey.id)
            toast.success('Форму видалено')
            onDeleted()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка')
        }
    }
    const handleExport = async () => {
        setExporting(true)
        try {
            await downloadSurveyCsv(survey.id)
            toast.success('CSV завантажено')
        } catch (err) {
            toast.error(
                err.message || err.response?.data?.error || 'Помилка експорту'
            )
        } finally {
            setExporting(false)
        }
    }
    return (
        <div className="sv-card-actions">
            <button
                className="sv-btn sv-btn-secondary sv-btn-sm"
                onClick={handleExport}
                disabled={exporting}
            >
                {exporting ? 'Експортую...' : 'Експорт CSV'}
            </button>
            {survey.status === 'open' && (
                <button className="sv-btn sv-btn-warning sv-btn-sm" onClick={handleClose}>
                    Закрити форму
                </button>
            )}
            <button className="sv-btn sv-btn-danger sv-btn-sm" onClick={handleDelete}>
                Видалити
            </button>
        </div>
    )
}

/* ── GOD: dashboard ───────────────────────────────── */

const GodDashboard = ({ surveyId, questions }) => {
    const {
        data: respData,
        loading: l1,
        error: e1,
        refetch: r1,
    } = useApi(() => fetchSurveyResponses(surveyId), [surveyId])
    const {
        data: aggData,
        loading: l2,
        error: e2,
        refetch: r2,
    } = useApi(() => fetchSurveyAggregate(surveyId), [surveyId])

    if (l1 || l2) return <LoadingSpinner />
    if (e1) return <ErrorMessage message={e1} onRetry={r1} />
    if (e2) return <ErrorMessage message={e2} onRetry={r2} />
    if (!respData || !aggData) return null

    const progressPct = respData.totalBrigades
        ? Math.round((respData.answeredCount / respData.totalBrigades) * 100)
        : 0

    const answered = respData.responses || []
    const notAnswered = respData.notAnswered || []

    return (
        <div className="sv-detail-grid">
            <div className="sv-panel">
                <h4>Агрегація відповідей</h4>
                {questions.length === 0 && <p className="sv-muted">Питань немає</p>}
                {aggData.perQuestion.map((q) => (
                    <AggregateBlock key={q.questionId} q={q} />
                ))}
            </div>

            <div className="sv-panel">
                <h4>
                    Прогрес: {respData.answeredCount} / {respData.totalBrigades}
                </h4>
                <div className="sv-progress">
                    <div className="sv-progress-bar" style={{ width: `${progressPct}%` }} />
                </div>
                <p className="sv-card-meta">{progressPct}% частин відповіли</p>

                <h4 style={{ marginTop: '1rem' }}>Відповіли ({answered.length})</h4>
                <ul className="sv-brigades">
                    {answered.length === 0 && (
                        <li className="sv-muted">Поки що ніхто не відповів</li>
                    )}
                    {answered.map((r) => (
                        <li key={r.id} className="answered">
                            <span>
                                {r.brigadeName || r.Brigade?.name || `#${r.brigadeId}`}
                            </span>
                            <span className="sv-brigade-who">
                                {r.submittedByUserName || '—'} · {fmtDate(r.updatedAt)}
                            </span>
                        </li>
                    ))}
                </ul>

                <h4 style={{ marginTop: '1rem' }}>Не відповіли ({notAnswered.length})</h4>
                <ul className="sv-brigades">
                    {notAnswered.length === 0 && (
                        <li className="sv-muted">Усі частини відповіли 🎉</li>
                    )}
                    {notAnswered.map((b) => (
                        <li key={b.id} className="not-answered">
                            <span>{b.name}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

const AggregateBlock = ({ q }) => {
    return (
        <div className="sv-agg-q">
            <div className="sv-agg-title">
                <strong>{q.label}</strong>
                <span className="sv-agg-type">{q.type}</span>
                <span className="sv-muted">· {q.answeredCount} відп.</span>
            </div>

            {q.type === 'number' && (
                <>
                    <div className="sv-agg-stats">
                        <span>Сума: <strong>{q.sum}</strong></span>
                        <span>Середнє: <strong>{q.avg.toFixed(1)}</strong></span>
                        <span>Мін: <strong>{q.min ?? '—'}</strong></span>
                        <span>Макс: <strong>{q.max ?? '—'}</strong></span>
                    </div>
                    {q.byBrigade?.length > 0 && (
                        <div className="sv-agg-rows">
                            {q.byBrigade.map((v, i) => (
                                <div key={i}>
                                    {v.brigadeName || `#${v.brigadeId}`}:{' '}
                                    <strong>{v.number}</strong>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {q.type === 'presence' && (
                <div className="sv-agg-stats">
                    <span>Так: <strong>{q.trueCount}</strong></span>
                    <span>Ні: <strong>{q.falseCount}</strong></span>
                </div>
            )}

            {q.type === 'state' && (
                <>
                    <div className="sv-agg-stats">
                        {Object.entries(q.counts || {}).map(([opt, c]) => (
                            <span key={opt}>
                                {opt}: <strong>{c}</strong>
                            </span>
                        ))}
                    </div>
                    {q.byBrigade?.length > 0 && (
                        <div className="sv-agg-rows">
                            {q.byBrigade.map((v, i) => (
                                <div key={i}>
                                    {v.brigadeName || `#${v.brigadeId}`}:{' '}
                                    <strong>{v.state ?? '—'}</strong>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {q.type === 'text' && (
                <div className="sv-agg-rows">
                    {q.values?.length === 0 && <span className="sv-muted">Без відповідей</span>}
                    {q.values?.map((v, i) => (
                        <div key={i}>
                            <strong>{v.brigadeName || `#${v.brigadeId}`}:</strong>{' '}
                            {v.text || '—'}
                        </div>
                    ))}
                </div>
            )}

            {q.type === 'photo' && (
                <div className="sv-agg-rows">
                    {q.photos?.map((v, i) => (
                        <div key={i}>
                            {v.brigadeName || `#${v.brigadeId}`}: {v.urls.length} фото
                        </div>
                    ))}
                    {q.photos?.length === 0 && <span className="sv-muted">Без фото</span>}
                </div>
            )}
        </div>
    )
}

/* ── RW: fill form ────────────────────────────────── */

const RwFillForm = ({ survey, onSaved }) => {
    const { user } = useAuth()
    const hasBrigade = Boolean(user?.brigadeId)

    const initial = useMemo(() => {
        const base = {}
        for (const q of survey.questions || []) {
            const prev = survey.myResponse?.answers?.[q.id]
            if (q.type === 'number') base[q.id] = prev?.number ?? ''
            else if (q.type === 'presence') base[q.id] = prev?.presence ?? null
            else if (q.type === 'state') base[q.id] = prev?.state ?? ''
            else if (q.type === 'text') base[q.id] = prev?.text ?? ''
            else if (q.type === 'photo')
                base[q.id] = Array.isArray(prev?.photos) ? prev.photos : []
        }
        return base
    }, [survey])

    const [form, setForm] = useState(initial)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        setForm(initial)
    }, [initial])

    if (!hasBrigade) {
        return (
            <div className="sv-panel">
                <p className="sv-muted">
                    Ваш обліковий запис не привʼязаний до частини — заповнення недоступне.
                </p>
            </div>
        )
    }

    if (survey.status !== 'open') {
        return (
            <div className="sv-panel">
                <p className="sv-muted">Форма закрита — заповнення недоступне.</p>
            </div>
        )
    }

    const update = (qid, val) => setForm((f) => ({ ...f, [qid]: val }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        for (const q of survey.questions || []) {
            if (!q.required) continue
            const v = form[q.id]
            const empty =
                v === '' ||
                v === null ||
                v === undefined ||
                (q.type === 'photo' && Array.isArray(v) && v.length === 0)
            if (empty) {
                toast.error(`Заповніть: ${q.label}`)
                return
            }
        }

        const answers = {}
        for (const q of survey.questions || []) {
            const v = form[q.id]
            if (q.type === 'number') {
                if (v !== '' && v !== null && v !== undefined) {
                    const n = Number(v)
                    if (Number.isFinite(n)) answers[q.id] = { number: n }
                }
            } else if (q.type === 'presence') {
                if (v === true || v === false) answers[q.id] = { presence: v }
            } else if (q.type === 'state') {
                if (v) answers[q.id] = { state: String(v) }
            } else if (q.type === 'text') {
                if (v) answers[q.id] = { text: String(v) }
            } else if (q.type === 'photo') {
                answers[q.id] = { photos: Array.isArray(v) ? v : [] }
            }
        }

        setSaving(true)
        try {
            await upsertSurveyResponse(survey.id, answers)
            toast.success(survey.myResponse ? 'Відповідь оновлено' : 'Відповідь надіслано')
            onSaved?.()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка збереження')
        } finally {
            setSaving(false)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            {survey.myResponse && (
                <p className="sv-muted">
                    Ваша частина вже надсилала відповідь{' '}
                    {fmtDate(survey.myResponse.updatedAt)} — можна оновити.
                </p>
            )}

            {(survey.questions || []).map((q, idx) => (
                <div key={q.id} className="sv-fill-question">
                    <label className="sv-fill-label">
                        {idx + 1}. {q.label}
                        {q.required && <span className="sv-required">*</span>}
                        {q.type === 'number' && q.config?.unit && (
                            <span className="sv-fill-hint"> ({q.config.unit})</span>
                        )}
                    </label>
                    <FillInput q={q} value={form[q.id]} onChange={(v) => update(q.id, v)} />
                </div>
            ))}

            <div className="sv-form-actions">
                <button
                    type="submit"
                    className="sv-btn sv-btn-primary"
                    disabled={saving}
                >
                    {saving
                        ? 'Зберігаю...'
                        : survey.myResponse
                        ? 'Оновити відповідь'
                        : 'Надіслати відповідь'}
                </button>
            </div>
        </form>
    )
}

const FillInput = ({ q, value, onChange }) => {
    if (q.type === 'number') {
        return (
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="0"
            />
        )
    }
    if (q.type === 'presence') {
        return (
            <div className="sv-presence">
                <button
                    type="button"
                    className={value === true ? 'active yes' : ''}
                    onClick={() => onChange(true)}
                >
                    Так
                </button>
                <button
                    type="button"
                    className={value === false ? 'active no' : ''}
                    onClick={() => onChange(false)}
                >
                    Ні
                </button>
            </div>
        )
    }
    if (q.type === 'state') {
        const options = q.config?.options || []
        return (
            <div className="sv-state-options">
                {options.map((opt) => (
                    <button
                        key={opt}
                        type="button"
                        className={`sv-state-option ${value === opt ? 'active' : ''}`}
                        onClick={() => onChange(opt)}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        )
    }
    if (q.type === 'text') {
        return (
            <textarea
                rows={3}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Ваша відповідь"
            />
        )
    }
    if (q.type === 'photo') {
        return (
            <div className="sv-photo-stub">
                📷 Завантаження фото буде додане пізніше
                {Array.isArray(value) && value.length > 0 && (
                    <> · збережено: {value.length}</>
                )}
            </div>
        )
    }
    return null
}

export default SurveyPage
