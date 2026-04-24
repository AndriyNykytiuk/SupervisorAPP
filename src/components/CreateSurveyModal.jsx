import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'react-toastify'
import { createSurvey } from '../api/services.js'
import DateTimePicker from './ui/DateTimePicker.jsx'
import '../scss/surveys.scss'

const TYPE_LABELS = {
    number: 'Число',
    presence: 'Наявність',
    state: 'Стан',
    text: 'Текст',
    photo: 'Фото (скоро)',
}

const emptyQuestion = (type = 'number') => {
    const base = {
        _local: Math.random().toString(36).slice(2),
        label: '',
        type,
        required: false,
        config: {},
    }
    if (type === 'state') base.config = { options: ['робочий', 'на ремонті', 'списано'] }
    if (type === 'number') base.config = { unit: 'шт' }
    if (type === 'photo') base.config = { maxFiles: 5 }
    return base
}

const CreateSurveyModal = ({ isOpen, onClose, onCreated }) => {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [deadline, setDeadline] = useState(null)
    const [questions, setQuestions] = useState([emptyQuestion('number')])
    const [saving, setSaving] = useState(false)

    if (!isOpen) return null

    const reset = () => {
        setTitle('')
        setDescription('')
        setDeadline(null)
        setQuestions([emptyQuestion('number')])
    }

    const updateQ = (idx, patch) => {
        setQuestions((qs) => qs.map((q, i) => (i === idx ? { ...q, ...patch } : q)))
    }

    const updateQConfig = (idx, patch) => {
        setQuestions((qs) =>
            qs.map((q, i) => (i === idx ? { ...q, config: { ...q.config, ...patch } } : q))
        )
    }

    const addQuestion = (type) => {
        setQuestions((qs) => [...qs, emptyQuestion(type)])
    }

    const removeQuestion = (idx) => {
        setQuestions((qs) => qs.filter((_, i) => i !== idx))
    }

    const moveQuestion = (idx, dir) => {
        setQuestions((qs) => {
            const target = idx + dir
            if (target < 0 || target >= qs.length) return qs
            const next = [...qs]
            ;[next[idx], next[target]] = [next[target], next[idx]]
            return next
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!title.trim()) {
            toast.error('Назва форми обовʼязкова')
            return
        }
        if (!questions.length) {
            toast.error('Додайте хоча б одне питання')
            return
        }
        for (let i = 0; i < questions.length; i += 1) {
            const q = questions[i]
            if (!q.label.trim()) {
                toast.error(`Питання #${i + 1}: заповніть назву`)
                return
            }
            if (q.type === 'state') {
                const opts = (q.config?.options || []).map((o) => o.trim()).filter(Boolean)
                if (opts.length === 0) {
                    toast.error(`Питання #${i + 1}: додайте варіанти`)
                    return
                }
            }
        }

        setSaving(true)
        try {
            const payload = {
                title: title.trim(),
                description: description.trim() || null,
                deadline: deadline ? deadline.toISOString() : null,
                questions: questions.map((q, idx) => ({
                    order: idx,
                    label: q.label.trim(),
                    type: q.type,
                    required: !!q.required,
                    config: q.config || {},
                })),
            }
            await createSurvey(payload)
            toast.success('Форму створено')
            onCreated?.()
            reset()
            onClose()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка створення форми')
        } finally {
            setSaving(false)
        }
    }

    return createPortal(
        <div className="sv-modal-overlay" onClick={onClose}>
            <div className="sv-modal" onClick={(e) => e.stopPropagation()}>
                <div className="sv-modal-header">
                    <h3>Нова форма</h3>
                    <button className="sv-close" onClick={onClose}>✕</button>
                </div>
                <form className="sv-form" onSubmit={handleSubmit}>
                    <label>
                        Назва форми *
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Напр. Облік рукавів"
                            required
                        />
                    </label>
                    <label>
                        Опис
                        <textarea
                            rows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Коротке пояснення, чому збираємо ці дані"
                        />
                    </label>
                    <label>
                        Дедлайн (опційно)
                        <DateTimePicker
                            value={deadline}
                            onChange={setDeadline}
                            minDate={new Date()}
                        />
                    </label>

                    <div>
                        <strong>Питання</strong>
                        <div className="sv-q-list">
                            {questions.map((q, idx) => (
                                <QuestionEditor
                                    key={q._local}
                                    q={q}
                                    idx={idx}
                                    total={questions.length}
                                    onChange={(patch) => updateQ(idx, patch)}
                                    onConfigChange={(patch) => updateQConfig(idx, patch)}
                                    onRemove={() => removeQuestion(idx)}
                                    onMove={(dir) => moveQuestion(idx, dir)}
                                />
                            ))}
                        </div>

                        <div className="sv-q-add">
                            <span className="sv-muted">Додати питання:</span>
                            {Object.keys(TYPE_LABELS).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    className="sv-btn sv-btn-secondary sv-btn-sm"
                                    onClick={() => addQuestion(t)}
                                >
                                    + {TYPE_LABELS[t]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="sv-form-actions">
                        <button
                            type="button"
                            className="sv-btn sv-btn-secondary"
                            onClick={onClose}
                        >
                            Скасувати
                        </button>
                        <button
                            type="submit"
                            className="sv-btn sv-btn-primary"
                            disabled={saving}
                        >
                            {saving ? 'Створюю...' : 'Створити форму'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    )
}

const QuestionEditor = ({ q, idx, total, onChange, onConfigChange, onRemove, onMove }) => {
    return (
        <div className="sv-q-card">
            <div className="sv-q-card-head">
                <strong>
                    #{idx + 1} <span className="sv-chip">{TYPE_LABELS[q.type]}</span>
                </strong>
                <div style={{ display: 'flex', gap: '.3rem' }}>
                    <button
                        type="button"
                        className="sv-btn sv-btn-ghost sv-btn-sm"
                        disabled={idx === 0}
                        onClick={() => onMove(-1)}
                        title="Вгору"
                    >
                        ↑
                    </button>
                    <button
                        type="button"
                        className="sv-btn sv-btn-ghost sv-btn-sm"
                        disabled={idx === total - 1}
                        onClick={() => onMove(1)}
                        title="Вниз"
                    >
                        ↓
                    </button>
                    <button
                        type="button"
                        className="sv-btn sv-btn-danger sv-btn-sm"
                        onClick={onRemove}
                    >
                        Видалити
                    </button>
                </div>
            </div>

            <div className="sv-q-card-body">
                <label className="sv-q-card-full">
                    Назва питання *
                    <input
                        type="text"
                        value={q.label}
                        onChange={(e) => onChange({ label: e.target.value })}
                        placeholder="Напр. Кількість рукавів D77"
                    />
                </label>

                <label>
                    Тип
                    <select
                        value={q.type}
                        onChange={(e) => {
                            const type = e.target.value
                            let config = {}
                            if (type === 'state')
                                config = { options: ['робочий', 'на ремонті', 'списано'] }
                            if (type === 'number') config = { unit: 'шт' }
                            if (type === 'photo') config = { maxFiles: 5 }
                            onChange({ type, config })
                        }}
                    >
                        {Object.keys(TYPE_LABELS).map((t) => (
                            <option key={t} value={t}>
                                {TYPE_LABELS[t]}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    <span>
                        <input
                            type="checkbox"
                            checked={!!q.required}
                            onChange={(e) => onChange({ required: e.target.checked })}
                        />{' '}
                        Обовʼязкове
                    </span>
                </label>

                {q.type === 'number' && (
                    <label>
                        Одиниця (опційно)
                        <input
                            type="text"
                            value={q.config?.unit || ''}
                            onChange={(e) => onConfigChange({ unit: e.target.value })}
                            placeholder="шт / л / кг"
                        />
                    </label>
                )}

                {q.type === 'state' && (
                    <label className="sv-q-card-full">
                        Варіанти стану (через кому)
                        <input
                            type="text"
                            value={(q.config?.options || []).join(', ')}
                            onChange={(e) =>
                                onConfigChange({
                                    options: e.target.value
                                        .split(',')
                                        .map((s) => s.trim())
                                        .filter(Boolean),
                                })
                            }
                            placeholder="робочий, на ремонті, списано"
                        />
                    </label>
                )}

                {q.type === 'photo' && (
                    <label className="sv-q-card-full">
                        <span className="sv-muted">
                            Завантаження фото буде додане пізніше — поле збережеться як мок.
                        </span>
                    </label>
                )}
            </div>
        </div>
    )
}

export default CreateSurveyModal
