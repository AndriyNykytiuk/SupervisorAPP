import React, { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { MdCheckCircle, MdError } from 'react-icons/md'
import {
    fetchFireHydrant,
    fetchHydrantInspections,
    createHydrantInspection,
} from '../api/services.js'
import { useAuth } from '../context/AuthContext.jsx'
import '../scss/watersupply.scss'

const todayIso = () => {
    const d = new Date()
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
}

const formatDateTime = (s) => {
    if (!s) return '—'
    const d = new Date(s)
    if (Number.isNaN(d.getTime())) return s
    return d.toLocaleString('uk-UA', { dateStyle: 'short', timeStyle: 'short' })
}

const HydrantScanPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const canEdit = user?.role === 'GOD' || user?.role === 'RW'

    const [hydrant, setHydrant] = useState(null)
    const [inspections, setInspections] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const [form, setForm] = useState({
        inspectionDate: todayIso(),
        inspectorName: '',
        status: 'working',
        pressure: '',
        defects: '',
        notes: '',
        nextInspectionDate: '',
        waterClean: false,
        noWaterHammer: false,
        indicatorsPresent: false,
        conesPresent: false,
        groundingOk: false,
    })

    const load = useCallback(async () => {
        try {
            const [h, hist] = await Promise.all([
                fetchFireHydrant(id),
                fetchHydrantInspections(id).catch(() => []),
            ])
            setHydrant(h)
            setInspections(hist)
            setForm(prev => ({
                ...prev,
                inspectorName: prev.inspectorName || user?.name || h.inspectorName || '',
                pressure: prev.pressure || h.pressure || '',
                nextInspectionDate: prev.nextInspectionDate || (h.nextInspectionDate ? h.nextInspectionDate.split('T')[0] : ''),
            }))
        } catch (err) {
            setError(err.response?.data?.error || 'Не вдалося завантажити дані гідранта')
        } finally {
            setLoading(false)
        }
    }, [id, user])

    useEffect(() => { load() }, [load])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.inspectionDate) {
            toast.error('Вкажіть дату перевірки')
            return
        }
        setSaving(true)
        try {
            await createHydrantInspection(id, {
                inspectionDate: form.inspectionDate,
                inspectorName: form.inspectorName || null,
                status: form.status,
                pressure: form.pressure || null,
                defects: form.defects || null,
                notes: form.notes || null,
                nextInspectionDate: form.nextInspectionDate || null,
                waterClean: form.waterClean,
                noWaterHammer: form.noWaterHammer,
                indicatorsPresent: form.indicatorsPresent,
                conesPresent: form.conesPresent,
                groundingOk: form.groundingOk,
            })
            toast.success('Дані оновлено')
            navigate('/water-supply')
        } catch (err) {
            toast.error(err.response?.data?.error || 'Помилка збереження')
        } finally {
            setSaving(false)
        }
    }

    const CHECK_ITEMS = [
        { key: 'waterClean', label: 'Вода чиста' },
        { key: 'noWaterHammer', label: 'Гідроудари відсутні' },
        { key: 'indicatorsPresent', label: 'Покажчики в наявності' },
        { key: 'conesPresent', label: 'Конуси в наявності' },
        { key: 'groundingOk', label: 'Заземлення присутнє справне' },
    ]

    if (loading) return <div className='hydrant-scan-page'><p>Завантаження…</p></div>
    if (error) return <div className='hydrant-scan-page'><p style={{ color: 'red' }}>{error}</p></div>
    if (!hydrant) return null

    return (
        <div className='hydrant-scan-page'>
            <div className='hydrant-scan-header'>
                <h2>Гідрант №{hydrant.id}{hydrant.inventoryNumber ? ` — ${hydrant.inventoryNumber}` : ''}</h2>
                {hydrant.location && <p className='hydrant-scan-loc'>{hydrant.location}</p>}
                <div className='hydrant-current-state'>
                    <span className={`hydrant-state-badge ${hydrant.status === 'working' ? 'ok' : 'bad'}`}>
                        {hydrant.status === 'working' ? <MdCheckCircle /> : <MdError />}
                        {hydrant.status === 'working' ? ' Робочий' : ' Несправний'}
                    </span>
                    {hydrant.diameter && <span>Ø {hydrant.diameter} мм</span>}
                    {hydrant.lastInspectionDate && (
                        <span>Остання перевірка: {formatDateTime(hydrant.lastInspectionDate)}</span>
                    )}
                </div>
            </div>

            {canEdit && (
                <form className='hydrant-scan-form' onSubmit={handleSubmit}>
                    <h3>Нова перевірка</h3>

                    <label>Дата перевірки</label>
                    <input type='date' value={form.inspectionDate}
                        onChange={(e) => setForm({ ...form, inspectionDate: e.target.value })} required />

                    <label>Перевіряючий</label>
                    <input type='text' value={form.inspectorName}
                        onChange={(e) => setForm({ ...form, inspectorName: e.target.value })} />

                    <label>Технічний стан</label>
                    <select value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}>
                        <option value='working'>Робочий</option>
                        <option value='broken'>Несправний</option>
                    </select>

                    <div className='hydrant-checks'>
                        {CHECK_ITEMS.map(({ key, label }) => (
                            <label key={key} className='hydrant-check'>
                                <input type='checkbox' checked={form[key]}
                                    onChange={(e) => setForm({ ...form, [key]: e.target.checked })} />
                                <span>{label}</span>
                            </label>
                        ))}
                    </div>

                    <label>Тиск (атм)</label>
                    <input type='text' value={form.pressure}
                        onChange={(e) => setForm({ ...form, pressure: e.target.value })}
                        inputMode='decimal' />

                    <label>Опис недоліків {form.status === 'broken' && <span style={{ color: '#dc2626' }}>*</span>}</label>
                    <textarea
                        value={form.defects}
                        onChange={(e) => setForm({ ...form, defects: e.target.value })}
                        placeholder='Що саме не справне і що потрібно зробити'
                        rows={4}
                    />

                    <label>Додаткові нотатки</label>
                    <textarea value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />

                    <label>Наступна перевірка</label>
                    <input type='date' value={form.nextInspectionDate}
                        onChange={(e) => setForm({ ...form, nextInspectionDate: e.target.value })} />

                    <button type='submit' disabled={saving}>
                        {saving ? 'Збереження…' : 'Оновити дані'}
                    </button>
                    <button type='button' className='cancel-btn' onClick={() => navigate('/water-supply')}
                        style={{ marginTop: '0.5rem', background: '#e2e8f0', color: '#0f172a' }}>
                        Назад до списку
                    </button>
                </form>
            )}

            <div className='hydrant-history'>
                <h3>Історія перевірок ({inspections.length})</h3>
                {inspections.length === 0 ? (
                    <p style={{ color: '#64748b' }}>Перевірок ще не було</p>
                ) : (
                    inspections.map(ins => (
                        <div key={ins.id} className={`hydrant-history-row ${ins.status === 'working' ? 'ok' : 'bad'}`}>
                            <div className='hydrant-history-head'>
                                <strong>{formatDateTime(ins.inspectionDate)}</strong>
                                <span className={`hydrant-state-badge inline ${ins.status === 'working' ? 'ok' : 'bad'}`}>
                                    {ins.status === 'working' ? 'Робочий' : 'Несправний'}
                                </span>
                            </div>
                            <div className='hydrant-history-meta'>
                                {ins.inspectorName && <span>👤 {ins.inspectorName}</span>}
                                {ins.pressure && <span>🌊 {ins.pressure} атм</span>}
                            </div>
                            <div className='hydrant-history-checks'>
                                <span className={ins.waterClean ? 'chk on' : 'chk off'}>{ins.waterClean ? '✓' : '✗'} вода чиста</span>
                                <span className={ins.noWaterHammer ? 'chk on' : 'chk off'}>{ins.noWaterHammer ? '✓' : '✗'} гідроудари відсутні</span>
                                <span className={ins.indicatorsPresent ? 'chk on' : 'chk off'}>{ins.indicatorsPresent ? '✓' : '✗'} покажчики</span>
                                <span className={ins.conesPresent ? 'chk on' : 'chk off'}>{ins.conesPresent ? '✓' : '✗'} конуси</span>
                                <span className={ins.groundingOk ? 'chk on' : 'chk off'}>{ins.groundingOk ? '✓' : '✗'} заземлення</span>
                            </div>
                            {ins.defects && (
                                <div className='hydrant-history-defects'>
                                    <strong>Недоліки:</strong> {ins.defects}
                                </div>
                            )}
                            {ins.notes && <div className='hydrant-history-notes'>{ins.notes}</div>}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default HydrantScanPage
