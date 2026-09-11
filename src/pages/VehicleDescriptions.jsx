import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { toast } from 'react-toastify'
import {
    fetchVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    fetchVehicleItems,
    createVehicleItem,
    updateVehicleItem,
    deleteVehicleItem,
    fetchVehicleTypes,
    createVehicleType,
    syncVehicleStandard,
} from '../api/services.js'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
import { MdDelete, MdAdd, MdEdit, MdCheck, MdSearch, MdArrowBack } from 'react-icons/md'
import { TfiPrinter } from 'react-icons/tfi'
import html2pdf from 'html2pdf.js'
import '../scss/vehicledescriptions.scss'

const STATUSES = [
    { value: 'combat', label: 'В оперативному розрахунку' },
    { value: 'repair', label: 'В ремонті' },
    { value: 'reserve', label: 'В резерві' },
    { value: 'decommissioned', label: 'Списаний' },
]

// Порядок карток у сітці: спершу те, що в розрахунку, далі ремонт, резерв, списані
const STATUS_ORDER = Object.fromEntries(STATUSES.map((s, i) => [s.value, i]))

const statusLabel = (v) => STATUSES.find(s => s.value === v)?.label || '—'

// Норма з наказу — вільний текст: «1», «Відповідно до ТУ», «1х100», «3****», «-».
// Некомплект рахуємо лише коли норма починається з числа.
const requiredNumber = (requiredText) => {
    const m = String(requiredText ?? '').match(/^\s*(\d+)/)
    return m ? Number(m[1]) : null
}

const shortageOf = (item) => {
    const need = requiredNumber(item.requiredText)
    if (need === null) return null
    const diff = need - (Number(item.actualQuantity) || 0)
    return diff > 0 ? diff : null
}

// Стандартний блок приміток з наказу — підставляється у форму друку, редагується.
const NOTES_TEMPLATE = `1. До складу аптечки автомобільної з запасними деталями дозволяється вносити запасні деталі, частини та приладдя, необхідні для проведення поточного ремонту пожежного автомобіля відповідно до моделі та регламентних робіт на ньому.
2. В підрозділах, в районі виїзду яких знаходяться водні об'єкти, пожежні автомобілі (при відсутності спеціальних автомобілів) додатково комплектуються обладнанням, що вивозиться у разі виникнення надзвичайної ситуації (події) на водних об'єктах, на частину: рятувальним кругом з мотузкою ‒ 1 шт.; рятувальним жилетом – 3 шт.; рятувальним повітряним комплектом типу "Соломинка" – 1 шт.; надувним гумовим човном довжиною менше 4 метрів і механічними двигунами до 10 кіловат або без нього – 1 шт.; гідрокостюм рятувальника сухого типу – 3 шт.
3. До комплекту електроінструменту аварійно-рятувального акумуляторного можуть входити залежно від потреби: перфоратор, домкрат, шабельна пила, дискова пила, шурупокрут, мультитул.
4. До комплекту гідравлічного аварійно-рятувального інструменту можуть входити в залежності від потреби: масляна насосна станція, насос масляний ручний, шланги із фітингами, різак, розтискач, комбінований інструмент, домкрат, вскривач дверей, гідроклин, опори домкрата, клини та блоки.
5. До діелектричного комплекту входять: ножиці діелектричні – 1 шт.; боти діелектричні – 2 пари; рукавиці діелектричні – 2 пари; килимок діелектричний – 1 шт.
6. До комплекту пневматичного аварійно-рятувального інструменту можуть входити залежно від потреби: компресор, повітряний балон з редуктором, шланги із фітингами, заглушки, подушки, пробки, бандажі.
7. У кожній пожежно-рятувальній частині передбачаються на особовий склад чергової зміни костюми захисні хімічні. Вивозяться у разі виникнення пожежі або аварії на хімічно-небезпечному об'єкті.
8. Автомобіль не комплектується у разі комплектації його багаторежимними комбінованими стволами.
9. В залежності від оперативно-тактичної характеристики гарнізону – пожежні автомобілі за рішенням керівника територіального органу можуть комплектуватися додатковим пожежно-технічним оснащенням.
10. Засоби індивідуального захисту органів дихання (автономні регенерувальні дихальні апарати зі стисненим киснем або зі стисненим киснем і азотом, з терміном захисної дії не менше 4 год.) комплектуються підрозділи, що призначені для ліквідації наслідків небезпечних подій у підземних спорудах метрополітену, шахтах, печерах, підземних виробках та виробництвах.
11. Кількість індивідуальних електронних приладів (нерухомого стану) безпеки пожежних рятувальників має відповідати кількості захисних дихальних апаратів, встановлених на пожежних автомобілях, що перебувають в оперативному розрахунку та резерві.

* ‒ Автомобіль комплектується рукавами одним із діаметрів.
** ‒ Автомобіль комплектується спеціальним інструментом з урахуванням встановленого спецобладнання.
*** ‒ Автомобіль комплектується мотопомпою, якщо це передбачено заводом виробником.
**** ‒ комплектуються автоцистерни, які перебувають в оперативному розрахунку та оперативному резерві протягом пожежонебезпечного періоду.
***** ‒ Допускається комплектування основних пожежних автоцистерн електростанціями автономними переносними або інверторними установками потужністю менше 3 кВт відповідно до технічних можливостей автомобіля.`

// ─── Розмітка блоку «ЗАТВЕРДЖУЮ» у PDF ───
// Правте ці три значення, щоб посунути або звузити блок:
//   offsetLeft — порожнє поле зліва; більший % зсуває блок правіше
//   width      — ширина самого блоку; менший % робить його вужчим
//   align      — вирівнювання тексту всередині: 'left' / 'center' / 'right'
// Сума offsetLeft + width має дорівнювати 100%.
const APPROVAL_BLOCK = {
    offsetLeft: '60%',
    width: '40%',
    align: 'left',
}

// ─── Розмітка блоку «Опис склав» у PDF ───
// Ті самі три важелі, що й у APPROVAL_BLOCK. Підпис зазвичай ставлять зліва,
// тому offsetLeft тут 0; щоб зсунути блок правіше — збільшуйте його.
const COMPOSER_BLOCK = {
    offsetLeft: '0%',
    width: '100%',
    align: 'left',
}

// Реквізити шапки й підпису вводяться перед друком.
// У БД не зберігаються — між друками підставляються з localStorage.
const PRINT_STORAGE_KEY = 'vd-print-requisites'
const PRINT_DEFAULTS = {
    unitFullName: '',
    approverPosition: '',
    approverRank: '',
    approverName: '',
    approvalYear: String(new Date().getFullYear()),
    composerPosition: '',
    composerRank: '',
    composerName: '',
    notes: NOTES_TEMPLATE,
}

const loadPrintRequisites = () => {
    try {
        const saved = JSON.parse(localStorage.getItem(PRINT_STORAGE_KEY) || '{}')
        return { ...PRINT_DEFAULTS, ...saved }
    } catch {
        return { ...PRINT_DEFAULTS }
    }
}

const escapeHtml = (s) => String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Кожен рядок поля — окремий рядок документа. Задовгий рядок переноситься по
// ширині блоку, щоб не виїжджати за поле сторінки.
const multilineHtml = (s) => String(s ?? '')
    .split('\n')
    .filter(line => line.trim())
    .map(line => `<div>${escapeHtml(line.trim())}</div>`)
    .join('')

const VehicleDescriptions = ({ selectedBrigade }) => {
    const { user } = useAuth()
    const isGod = user?.role === 'GOD'
    const isRW = user?.role === 'RW'
    const canEdit = isGod || isRW

    const [vehicles, setVehicles] = useState([])
    const [selectedVehicleId, setSelectedVehicleId] = useState(null)
    const [items, setItems] = useState([])
    const [vehicleTypes, setVehicleTypes] = useState([])

    const [loading, setLoading] = useState(false)
    const [itemsLoading, setItemsLoading] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // ── Add-vehicle modal ──
    const [showAddModal, setShowAddModal] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [form, setForm] = useState({
        brand: '', stateNumber: '', yearOfManufacture: '',
        status: 'combat', vehicleTypeId: '', notes: '', cloneFromVehicleId: '',
    })

    // ── New inventory row ──
    const [newItem, setNewItem] = useState({ name: '', unit: 'шт.', requiredText: '', actualQuantity: '' })

    // ── Print modal ──
    const [showPrintModal, setShowPrintModal] = useState(false)
    const [printForm, setPrintForm] = useState(loadPrintRequisites)

    // ── New vehicle type (GOD only) ──
    const [showNewType, setShowNewType] = useState(false)
    const [newTypeName, setNewTypeName] = useState('')
    const [isCreatingType, setIsCreatingType] = useState(false)

    const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || null

    // Значення числових полів на момент фокусу — щоб відкотити, якщо нічого не ввели
    const focusOriginals = useRef({})

    // ── Load vehicles ───────────────────────────────
    useEffect(() => {
        if (!selectedBrigade) {
            setVehicles([])
            setSelectedVehicleId(null)
            return
        }
        loadVehicles()
        fetchVehicleTypes(selectedBrigade).then(setVehicleTypes).catch(() => setVehicleTypes([]))
    }, [selectedBrigade])

    const loadVehicles = async ({ silent = false, keepSelection = true } = {}) => {
        if (!silent) setLoading(true)
        try {
            const data = await fetchVehicles({ brigadeId: selectedBrigade })
            setVehicles(data)
            // Автовибору немає: спершу показуємо сітку авто, авто відкриває користувач
            setSelectedVehicleId(prev => (keepSelection && prev && data.some(v => v.id === prev)) ? prev : null)
        } catch (err) {
            console.error('Failed to load vehicles:', err)
            toast.error('Помилка завантаження автомобілів')
        } finally {
            if (!silent) setLoading(false)
        }
    }

    // ── Load inventory of the selected vehicle ──────
    useEffect(() => {
        if (!selectedVehicleId) {
            setItems([])
            return
        }
        loadItems()
    }, [selectedVehicleId])

    const loadItems = async ({ silent = false } = {}) => {
        if (!silent) setItemsLoading(true)
        try {
            const data = await fetchVehicleItems(selectedVehicleId)
            setItems(data)
        } catch (err) {
            console.error('Failed to load inventory:', err)
        } finally {
            if (!silent) setItemsLoading(false)
        }
    }

    // ── Vehicle CRUD ────────────────────────────────
    const handleAddVehicle = async (e) => {
        if (e?.preventDefault) e.preventDefault()
        if (!form.brand.trim()) {
            toast.error('Вкажіть марку автомобіля')
            return
        }
        if (!selectedBrigade) {
            toast.error('Оберіть частину')
            return
        }
        setIsCreating(true)
        try {
            const created = await createVehicle({
                brand: form.brand.trim(),
                stateNumber: form.stateNumber.trim() || null,
                yearOfManufacture: Number(form.yearOfManufacture) || null,
                status: form.status,
                vehicleTypeId: form.vehicleTypeId ? Number(form.vehicleTypeId) : null,
                notes: form.notes.trim() || null,
                brigadeId: selectedBrigade,
                ...(form.cloneFromVehicleId ? { cloneFromVehicleId: Number(form.cloneFromVehicleId) } : {}),
            })
            setShowAddModal(false)
            setForm({
                brand: '', stateNumber: '', yearOfManufacture: '',
                status: 'combat', vehicleTypeId: '', notes: '', cloneFromVehicleId: '',
            })
            toast.success(created?.clonedCount > 0
                ? `Автомобіль додано (скопійовано позицій: ${created.clonedCount})`
                : 'Автомобіль додано')
            await loadVehicles({ keepSelection: false })
            if (created?.id) setSelectedVehicleId(created.id)
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Помилка при додаванні автомобіля')
        } finally {
            setIsCreating(false)
        }
    }

    const handleVehicleFieldChange = async (field, value) => {
        if (!selectedVehicleId) return
        try {
            await updateVehicle(selectedVehicleId, { [field]: value })
        } catch (err) {
            toast.error('Помилка при оновленні картки')
            loadVehicles({ silent: true })
        }
    }

    // Тип впливає і на підпис у картці, тому оновлюємо ще й вкладений VehicleType
    const applyVehicleType = (vehicleId, typeId, typesList = vehicleTypes) => {
        const type = typesList.find(t => t.id === typeId) || null
        setVehicles(prev => prev.map(v => v.id === vehicleId
            ? { ...v, vehicleTypeId: typeId, VehicleType: type ? { id: type.id, name: type.name } : null }
            : v))
        handleVehicleFieldChange('vehicleTypeId', typeId)
    }

    const handleDeleteVehicle = async (id) => {
        if (!confirm('Видалити автомобіль разом з його описом майна?')) return
        try {
            await deleteVehicle(id)
            toast.success('Автомобіль видалено')
            if (selectedVehicleId === id) setSelectedVehicleId(null)
            loadVehicles({ keepSelection: false })
        } catch (err) {
            toast.error('Помилка при видаленні автомобіля')
        }
    }

    // ── Inventory CRUD ──────────────────────────────
    const handleAddItem = async () => {
        if (!newItem.name.trim() || !selectedVehicleId) return
        try {
            await createVehicleItem(selectedVehicleId, {
                name: newItem.name.trim(),
                unit: newItem.unit.trim() || 'шт.',
                requiredText: newItem.requiredText.trim() || null,
                actualQuantity: Number(newItem.actualQuantity) || 0,
            })
            setNewItem({ name: '', unit: 'шт.', requiredText: '', actualQuantity: '' })
            toast.success('Позицію додано')
            loadItems({ silent: true })
            loadVehicles({ silent: true })
        } catch (err) {
            toast.error('Помилка при додаванні позиції')
        }
    }

    // Норматив живе в БД (НОРМА-3, веде GOD) — просто просимо сервер підтягнути
    // позиції, яких ще немає в описі. Введені кількості не змінюються.
    const handleFillStandard = async () => {
        if (!selectedVehicleId) return
        if (!selectedVehicle?.vehicleTypeId) {
            toast.error('Спершу оберіть тип техніки для авто')
            return
        }
        setItemsLoading(true)
        try {
            const { added } = await syncVehicleStandard(selectedVehicleId)
            toast.success(added > 0 ? `Додано позицій: ${added}` : 'Опис уже повний за нормативом')
            await loadItems({ silent: true })
            loadVehicles({ silent: true })
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Помилка при підтягуванні нормативу')
        } finally {
            setItemsLoading(false)
        }
    }

    // Optimistic: local state already updated in onChange, PUT fires on blur.
    const handleItemFieldChange = async (itemId, field, value) => {
        try {
            await updateVehicleItem(selectedVehicleId, itemId, { [field]: value })
        } catch (err) {
            toast.error('Помилка при оновленні')
            loadItems({ silent: true })
        }
    }

    const patchItemLocal = (itemId, field, value) => {
        setItems(prev => prev.map(i => i.id === itemId ? { ...i, [field]: value } : i))
    }

    // Числові поля: при фокусі очищаються, щоб нове значення не дописувалось до
    // старого («0» + «1» = «01»). Пішли з поля порожнім — повертаємо попереднє
    // й не чіпаємо сервер; ввели те саме число — теж без запиту.
    const numericField = ({ key, value, setLocal, save }) => ({
        onFocus: () => {
            focusOriginals.current[key] = value
            setLocal('')
        },
        onChange: (e) => setLocal(e.target.value),
        onBlur: (e) => {
            const original = focusOriginals.current[key]
            delete focusOriginals.current[key]
            const raw = String(e.target.value).trim()
            if (raw === '') {
                setLocal(original)
                return
            }
            const next = Number(raw) || 0
            setLocal(next)
            if (Number(original) !== next) save(next)
        },
    })

    const handleDeleteItem = async (itemId) => {
        if (!confirm('Видалити цю позицію з опису?')) return
        try {
            await deleteVehicleItem(selectedVehicleId, itemId)
            toast.success('Позицію видалено')
            loadItems({ silent: true })
            loadVehicles({ silent: true })
        } catch (err) {
            toast.error('Помилка при видаленні позиції')
        }
    }

    // ── Vehicle type: список бачать усі, створювати може лише GOD ──
    const handleAddType = async (onCreated) => {
        const name = newTypeName.trim()
        if (!name) return
        setIsCreatingType(true)
        try {
            const created = await createVehicleType({ name })
            const data = await fetchVehicleTypes(selectedBrigade)
            setVehicleTypes(data)
            setNewTypeName('')
            setShowNewType(false)
            toast.success('Тип техніки додано')
            // Свіжий список передаємо явно — стан vehicleTypes у цьому замиканні ще старий
            if (created?.id && onCreated) onCreated(created.id, data)
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Помилка при додаванні типу')
        } finally {
            setIsCreatingType(false)
        }
    }

    const renderTypeSelect = ({ value, onChange, onCreated, className = '' }) => (
        <div className="vd-type-field">
            <div className="vd-type-row">
                <select className={className} value={value} onChange={onChange}>
                    <option value="">— без типу —</option>
                    {vehicleTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                {isGod && (
                    <button
                        type="button"
                        className="vd-type-add-btn"
                        title={showNewType ? 'Скасувати' : 'Додати новий тип техніки'}
                        onClick={() => { setShowNewType(!showNewType); setNewTypeName('') }}
                    >
                        {showNewType ? '✕' : <MdAdd size={18} />}
                    </button>
                )}
            </div>

            {isGod && showNewType && (
                <div className="vd-type-row vd-type-new">
                    <input
                        type="text"
                        autoFocus
                        value={newTypeName}
                        placeholder="Назва нового типу"
                        onChange={(e) => setNewTypeName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                handleAddType(onCreated)
                            }
                        }}
                    />
                    <button
                        type="button"
                        className="vd-btn-add"
                        disabled={isCreatingType}
                        onClick={() => handleAddType(onCreated)}
                    >
                        {isCreatingType ? '…' : 'Створити'}
                    </button>
                </div>
            )}
        </div>
    )

    // ── PDF: документ за зразком опису ──────────────
    const exportToPdf = () => {
        if (!selectedVehicle || !items.length) return
        const v = selectedVehicle
        const r = printForm
        const today = new Date().toLocaleDateString('uk-UA')
        const vehicleTitle = [v.brand, v.stateNumber].filter(Boolean).join('  ')

        try {
            localStorage.setItem(PRINT_STORAGE_KEY, JSON.stringify(r))
        } catch {
            // приватний режим — просто не запам'ятовуємо
        }

        const cell = 'border: 1px solid #000; padding: 3px 5px; font-size: 14px; vertical-align: middle;'
        const head = 'border: 1px solid #000; padding: 4px 5px; font-weight: 700; text-align: center; vertical-align: middle;'

        const html = `
        <div style="font-family: 'Times New Roman', serif; padding: 10px 16px; color: #000; font-size: 14px; line-height: 1.25;">
            <table style="width: 100%; table-layout: fixed; border-collapse: collapse; margin-bottom: 10px;">
                <tr>
                    <td style="width: ${APPROVAL_BLOCK.offsetLeft};"></td>
                    <td style="width: ${APPROVAL_BLOCK.width}; vertical-align: top; text-align: ${APPROVAL_BLOCK.align};">
                        <div style="font-weight: 700;">ЗАТВЕРДЖУЮ</div>
                        ${multilineHtml(r.approverPosition)}
                        <div>${escapeHtml(r.approverRank)}</div>
                        <div style="margin-top: 10px; text-align: right;">${escapeHtml(r.approverName)}</div>
                        <div style="margin-top: 4px;">«____»____________ ${escapeHtml(r.approvalYear)} року.</div>
                    </td>
                </tr>
            </table>

            <div style="text-align: center; font-weight: 700; font-size: 14px; margin: 12px 0 6px;">ОПИС</div>
            <div style="text-align: center; margin-bottom: 12px;">
                пожежно-технічного та аварійно-рятувального обладнання в ${escapeHtml(r.unitFullName)},
                яке знаходиться на ${escapeHtml(vehicleTitle)}
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead>
                    <tr>
                        <th style="${head} width: 32px;">№<br/>з/п</th>
                        <th style="${head}">Найменування</th>
                        <th style="${head} width: 60px;">Одиниці<br/>виміру</th>
                        <th style="${head} width: 78px;">Необхідно<br/>згідно наказу</th>
                        <th style="${head} width: 78px;">Знаходиться<br/>на автомобілі</th>
                        <th style="${head} width: 72px;">Некомплект<br/>на автомобілі</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map((it, i) => {
            const short = shortageOf(it)
            return `
                        <tr>
                            <td style="${cell} text-align: center;">${i + 1}</td>
                            <td style="${cell}">${escapeHtml(it.name)}</td>
                            <td style="${cell} text-align: center;">${escapeHtml(it.unit || '')}</td>
                            <td style="${cell} text-align: center;">${escapeHtml(it.requiredText || '-')}</td>
                            <td style="${cell} text-align: center;">${it.actualQuantity ?? 0}</td>
                            <td style="${cell} text-align: center;">${short === null ? '-' : short}</td>
                        </tr>`
        }).join('')}
                </tbody>
            </table>

            ${r.notes?.trim() ? `
            <div style="margin-top: 14px;">
                <div style="font-weight: 700; margin-bottom: 4px;">Примітки</div>
                <div style="white-space: pre-wrap; text-align: justify;">${escapeHtml(r.notes)}</div>
            </div>` : ''}

            <table style="width: 100%; table-layout: fixed; border-collapse: collapse; margin-top: 18px;">
                <tr>
                    <td style="width: ${COMPOSER_BLOCK.offsetLeft};"></td>
                    <td style="width: ${COMPOSER_BLOCK.width}; vertical-align: top; text-align: ${COMPOSER_BLOCK.align};">
                        <div style="margin-bottom: 10px;">Опис склав:</div>
                        ${multilineHtml(r.composerPosition)}
                        <!-- Звання і ПІБ — один рядок: звання зліва, прізвище навпроти справа -->
                        <table style="width: 100%; table-layout: fixed; border-collapse: collapse;">
                            <tr>
                                <td style="text-align: left; vertical-align: top;">${escapeHtml(r.composerRank)}</td>
                                <td style="text-align: right; vertical-align: top;">${escapeHtml(r.composerName)}</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>`

        const container = document.createElement('div')
        container.innerHTML = html
        document.body.appendChild(container)

        html2pdf()
            .set({
                margin: [0.4, 0.4, 0.4, 0.6],
                filename: `Опис_${v.brand}_${v.stateNumber || ''}_${today}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['css', 'legacy'], avoid: 'tr' },
            })
            .from(container)
            .outputPdf('bloburl')
            .then((url) => {
                document.body.removeChild(container)
                setShowPrintModal(false)
                window.open(url, '_blank')
            })
    }

    // ── Render ──────────────────────────────────────
    const visibleItems = items.filter(i =>
        (i.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    )

    // На першому шарі той самий рядок пошуку фільтрує автомобілі
    const visibleVehicles = vehicles
        .filter(v => {
            const q = searchQuery.toLowerCase()
            return (v.brand || '').toLowerCase().includes(q)
                || (v.stateNumber || '').toLowerCase().includes(q)
                || (v.VehicleType?.name || '').toLowerCase().includes(q)
        })
        .sort((a, b) => {
            const byStatus = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99)
            return byStatus !== 0 ? byStatus : (a.brand || '').localeCompare(b.brand || '', 'uk')
        })

    if (!selectedBrigade) {
        return (
            <div className="vd-page">
                <div className="vd-title-wrapp"><h2>Описи автомобілів</h2></div>
                <p className="vd-placeholder">Оберіть частину для перегляду описів</p>
            </div>
        )
    }

    return (
        <div className="vd-page">
            <div className="vd-title-wrapp"><h2>Описи автомобілів</h2></div>

            {/* ── Add-vehicle modal ── */}
            {showAddModal && (
                <div className="vd-modal-overlay" onClick={() => !isCreating && setShowAddModal(false)}>
                    <div className="vd-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="vd-modal-header">
                            <h3>Додати автомобіль</h3>
                            <button type="button" onClick={() => !isCreating && setShowAddModal(false)}>✕</button>
                        </div>
                        <form className="vd-modal-body" onSubmit={handleAddVehicle}>
                            <label>Марка / модель *</label>
                            <input
                                type="text"
                                autoFocus
                                value={form.brand}
                                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                                placeholder="напр. МАЗ 5337 АЦ-40"
                            />

                            <div className="vd-modal-row">
                                <div>
                                    <label>Держномер</label>
                                    <input
                                        type="text"
                                        value={form.stateNumber}
                                        onChange={(e) => setForm({ ...form, stateNumber: e.target.value })}
                                        placeholder="АА 0000 АА"
                                    />
                                </div>
                                <div>
                                    <label>Рік випуску</label>
                                    <input
                                        type="number"
                                        min="1900"
                                        max="2100"
                                        value={form.yearOfManufacture}
                                        onChange={(e) => setForm({ ...form, yearOfManufacture: e.target.value })}
                                    />
                                </div>
                            </div>

                            <label>Стан</label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                            >
                                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>

                            <label>Тип техніки</label>
                            {renderTypeSelect({
                                value: form.vehicleTypeId,
                                onChange: (e) => setForm({ ...form, vehicleTypeId: e.target.value }),
                                onCreated: (id) => setForm(f => ({ ...f, vehicleTypeId: String(id) })),
                            })}

                            <label>Скопіювати опис з</label>
                            <select
                                value={form.cloneFromVehicleId}
                                onChange={(e) => setForm({ ...form, cloneFromVehicleId: e.target.value })}
                                title="Позиції опису скопіюються з обраного автомобіля"
                            >
                                <option value="">— порожній опис —</option>
                                {vehicles.map(v => (
                                    <option key={v.id} value={v.id}>
                                        {v.brand}{v.stateNumber ? ` (${v.stateNumber})` : ''} — {v.itemsCount} поз.
                                    </option>
                                ))}
                            </select>

                            <label>Примітки</label>
                            <textarea
                                rows="2"
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            />

                            <div className="vd-modal-actions">
                                <button type="button" className="vd-btn-ghost" onClick={() => !isCreating && setShowAddModal(false)}>
                                    Скасувати
                                </button>
                                <button type="submit" className="vd-btn-add" disabled={isCreating}>
                                    {isCreating ? 'Додавання…' : 'Додати'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Print modal: реквізити шапки й підпису ── */}
            {showPrintModal && (
                <div className="vd-modal-overlay" onClick={() => setShowPrintModal(false)}>
                    <div className="vd-modal vd-modal--wide" onClick={(e) => e.stopPropagation()}>
                        <div className="vd-modal-header">
                            <h3>Реквізити опису</h3>
                            <button type="button" onClick={() => setShowPrintModal(false)}>✕</button>
                        </div>
                        <div className="vd-modal-body">
                            <p className="vd-modal-hint">
                                Підставляються в шапку та підпис документа. Зберігаються у цьому браузері,
                                тож наступного разу вводити не доведеться.
                            </p>

                            <label>Повна назва підрозділу</label>
                            <input
                                type="text"
                                value={printForm.unitFullName}
                                onChange={(e) => setPrintForm({ ...printForm, unitFullName: e.target.value })}
                                placeholder="1 ДПРЧ 3 ДПРЗ ГУ ДСНС України у Рівненській області"
                            />

                            <div className="vd-modal-section">ЗАТВЕРДЖУЮ</div>
                            <label>Посада — кожен рядок друкується окремо (Enter = перенос)</label>
                            <textarea
                                rows="3"
                                value={printForm.approverPosition}
                                onChange={(e) => setPrintForm({ ...printForm, approverPosition: e.target.value })}
                                placeholder={'Начальник 2 ДПРЗ ГУ ДСНС України\nу Рівненській області з охорони об\'єктів\nфілії "ВП "Рівненська АЕС"'}
                            />
                            <div className="vd-modal-row">
                                <div>
                                    <label>Звання</label>
                                    <input
                                        type="text"
                                        value={printForm.approverRank}
                                        onChange={(e) => setPrintForm({ ...printForm, approverRank: e.target.value })}
                                        placeholder="майор служби цивільного захисту"
                                    />
                                </div>
                                <div>
                                    <label>Ім'я та ПРІЗВИЩЕ</label>
                                    <input
                                        type="text"
                                        value={printForm.approverName}
                                        onChange={(e) => setPrintForm({ ...printForm, approverName: e.target.value })}
                                        placeholder="Василь ГРИЦАН"
                                    />
                                </div>
                            </div>
                            <label>Рік у даті затвердження</label>
                            <input
                                type="text"
                                className="vd-input-year"
                                value={printForm.approvalYear}
                                onChange={(e) => setPrintForm({ ...printForm, approvalYear: e.target.value })}
                            />

                            <div className="vd-modal-section">Опис склав</div>
                            <label>Посада — кожен рядок друкується окремо (Enter = перенос)</label>
                            <textarea
                                rows="3"
                                value={printForm.composerPosition}
                                onChange={(e) => setPrintForm({ ...printForm, composerPosition: e.target.value })}
                                placeholder={'Командир відділення 2 ДПРЗ ГУ ДСНС України\nу Рівненській області'}
                            />
                            <div className="vd-modal-row">
                                <div>
                                    <label>Звання</label>
                                    <input
                                        type="text"
                                        value={printForm.composerRank}
                                        onChange={(e) => setPrintForm({ ...printForm, composerRank: e.target.value })}
                                        placeholder="головний майстер-сержант служби цивільного захисту"
                                    />
                                </div>
                                <div>
                                    <label>Ім'я та ПРІЗВИЩЕ</label>
                                    <input
                                        type="text"
                                        value={printForm.composerName}
                                        onChange={(e) => setPrintForm({ ...printForm, composerName: e.target.value })}
                                        placeholder="Сергій ГАВРИЛЮК"
                                    />
                                </div>
                            </div>

                            <div className="vd-modal-section">
                                Примітки
                                <button
                                    type="button"
                                    className="vd-link-btn"
                                    onClick={() => setPrintForm({ ...printForm, notes: NOTES_TEMPLATE })}
                                >
                                    повернути шаблон
                                </button>
                            </div>
                            <textarea
                                rows="8"
                                value={printForm.notes}
                                onChange={(e) => setPrintForm({ ...printForm, notes: e.target.value })}
                                placeholder="Порожнє поле — блок приміток не друкується"
                            />

                            <div className="vd-modal-actions">
                                <button type="button" className="vd-btn-ghost" onClick={() => setShowPrintModal(false)}>
                                    Скасувати
                                </button>
                                <button type="button" className="vd-btn-add" onClick={exportToPdf}>
                                    <TfiPrinter /> Сформувати
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Toolbar ── */}
            <div className="vd-toolbar">
                {selectedVehicle && (
                    <button
                        className="vd-btn-back"
                        onClick={() => { setSelectedVehicleId(null); setSearchQuery('') }}
                        title="Повернутись до переліку автомобілів"
                    >
                        <MdArrowBack size={20} /> <span>До переліку</span>
                    </button>
                )}

                <div className="vd-search">
                    <MdSearch size={18} />
                    <input
                        type="text"
                        placeholder={selectedVehicle ? 'Пошук у описі за найменуванням…' : 'Пошук автомобіля…'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {canEdit && !selectedVehicle && (
                    <button className="vd-btn-add" onClick={() => setShowAddModal(true)}>
                        <MdAdd size={18} /> <span>Додати автомобіль</span>
                    </button>
                )}
                {canEdit && selectedVehicle && (
                    <button
                        className="vd-btn-edit-toggle"
                        onClick={() => setIsEditing(!isEditing)}
                        title={isEditing ? 'Завершити редагування' : 'Редагувати'}
                    >
                        {isEditing ? <MdCheck size={20} /> : <MdEdit size={20} />}
                    </button>
                )}
                {selectedVehicle && items.length > 0 && (
                    <button
                        className="print-btn"
                        onClick={() => { setPrintForm(loadPrintRequisites()); setShowPrintModal(true) }}
                        title="Друк опису"
                    >
                        <TfiPrinter />
                    </button>
                )}
            </div>

            {loading ? (
                <div className="vd-loader"><LoadingSpinner /></div>
            ) : vehicles.length === 0 ? (
                <p className="vd-placeholder">Для цієї частини ще немає жодного автомобіля</p>
            ) : !selectedVehicle ? (
                /* ── Layer 1: сітка автомобілів частини ── */
                <>
                    <div className="vd-grid">
                        {visibleVehicles.map(v => (
                            <button
                                key={v.id}
                                className="vd-grid-card"
                                onClick={() => { setSelectedVehicleId(v.id); setSearchQuery('') }}
                            >
                                <span className={`vd-grid-status vd-grid-status--${v.status}`}>{statusLabel(v.status)}</span>
                                <span className="vd-grid-brand">{v.brand}</span>
                                <span className="vd-grid-number">{v.stateNumber || 'без номера'}</span>
                                <span className="vd-grid-meta">
                                    {v.VehicleType?.name || 'без типу'}
                                    {v.yearOfManufacture ? ` • ${v.yearOfManufacture}` : ''}
                                </span>
                                <span className="vd-grid-count">
                                    {v.itemsCount > 0 ? `Опис: ${v.itemsCount} поз.` : 'Опис порожній'}
                                </span>
                            </button>
                        ))}
                    </div>

                    {visibleVehicles.length === 0 && (
                        <p className="vd-placeholder">За запитом «{searchQuery}» автомобілів не знайдено</p>
                    )}
                </>
            ) : (
                /* ── Layer 2: картка обраного авто та його опис ── */
                <div className="vd-layout">
                    <section className="vd-detail">
                        {(
                            <>
                                <div className="vd-card">
                                    <div className="vd-card-head">
                                        <h3>
                                            {selectedVehicle.brand}
                                            {selectedVehicle.stateNumber ? ` • ${selectedVehicle.stateNumber}` : ''}
                                        </h3>
                                        {canEdit && isEditing && (
                                            <button
                                                className="vd-delete-btn"
                                                onClick={() => handleDeleteVehicle(selectedVehicle.id)}
                                                title="Видалити автомобіль"
                                            >
                                                <MdDelete size={18} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="vd-card-grid">
                                        <label>
                                            <span>Марка / модель</span>
                                            {canEdit && isEditing ? (
                                                <input
                                                    type="text"
                                                    className="vd-input"
                                                    value={selectedVehicle.brand || ''}
                                                    onChange={(e) => setVehicles(prev => prev.map(v => v.id === selectedVehicle.id ? { ...v, brand: e.target.value } : v))}
                                                    onBlur={(e) => handleVehicleFieldChange('brand', e.target.value)}
                                                />
                                            ) : <b>{selectedVehicle.brand}</b>}
                                        </label>

                                        <label>
                                            <span>Держномер</span>
                                            {canEdit && isEditing ? (
                                                <input
                                                    type="text"
                                                    className="vd-input"
                                                    value={selectedVehicle.stateNumber || ''}
                                                    onChange={(e) => setVehicles(prev => prev.map(v => v.id === selectedVehicle.id ? { ...v, stateNumber: e.target.value } : v))}
                                                    onBlur={(e) => handleVehicleFieldChange('stateNumber', e.target.value)}
                                                />
                                            ) : <b>{selectedVehicle.stateNumber || '—'}</b>}
                                        </label>

                                        <label>
                                            <span>Рік випуску</span>
                                            {canEdit && isEditing ? (
                                                <input
                                                    type="number"
                                                    min="1900"
                                                    max="2100"
                                                    className="vd-input"
                                                    value={selectedVehicle.yearOfManufacture || ''}
                                                    {...numericField({
                                                        key: `vehicle-${selectedVehicle.id}-year`,
                                                        value: selectedVehicle.yearOfManufacture || '',
                                                        setLocal: (v) => setVehicles(prev => prev.map(v2 => v2.id === selectedVehicle.id ? { ...v2, yearOfManufacture: v } : v2)),
                                                        save: (v) => handleVehicleFieldChange('yearOfManufacture', v || null),
                                                    })}
                                                />
                                            ) : <b>{selectedVehicle.yearOfManufacture || '—'}</b>}
                                        </label>

                                        <label>
                                            <span>Стан</span>
                                            {canEdit && isEditing ? (
                                                <select
                                                    className="vd-input"
                                                    value={selectedVehicle.status || 'combat'}
                                                    onChange={(e) => {
                                                        const val = e.target.value
                                                        setVehicles(prev => prev.map(v => v.id === selectedVehicle.id ? { ...v, status: val } : v))
                                                        handleVehicleFieldChange('status', val)
                                                    }}
                                                >
                                                    {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                                </select>
                                            ) : <b>{statusLabel(selectedVehicle.status)}</b>}
                                        </label>

                                        <label>
                                            <span>Тип техніки</span>
                                            {canEdit && isEditing ? (
                                                renderTypeSelect({
                                                    className: 'vd-input',
                                                    value: selectedVehicle.vehicleTypeId || '',
                                                    onChange: (e) => {
                                                        const val = e.target.value
                                                        applyVehicleType(selectedVehicle.id, val ? Number(val) : null)
                                                    },
                                                    onCreated: (id, types) => applyVehicleType(selectedVehicle.id, id, types),
                                                })
                                            ) : <b>{selectedVehicle.VehicleType?.name || '—'}</b>}
                                        </label>

                                        <label className="vd-card-notes">
                                            <span>Примітки</span>
                                            {canEdit && isEditing ? (
                                                <textarea
                                                    rows="2"
                                                    className="vd-input"
                                                    value={selectedVehicle.notes || ''}
                                                    onChange={(e) => setVehicles(prev => prev.map(v => v.id === selectedVehicle.id ? { ...v, notes: e.target.value } : v))}
                                                    onBlur={(e) => handleVehicleFieldChange('notes', e.target.value)}
                                                />
                                            ) : <b>{selectedVehicle.notes || '—'}</b>}
                                        </label>
                                    </div>
                                </div>

                                {/* ── Inventory table ── */}
                                {itemsLoading ? (
                                    <div className="vd-loader"><LoadingSpinner /></div>
                                ) : (
                                    <div className="vd-table-wrapper">
                                        <div className="vd-content-title">
                                            <span>№ з/п</span>
                                            <span>Найменування</span>
                                            <span>Одиниці виміру</span>
                                            <span>Необхідно згідно наказу</span>
                                            <span>Знаходиться на автомобілі</span>
                                            <span>Некомплект на автомобілі</span>
                                            {canEdit && isEditing && <span>Дії</span>}
                                        </div>

                                        {visibleItems.map((item, index) => {
                                            const shortage = shortageOf(item)
                                            return (
                                            <div key={item.id} className="vd-content-row">
                                                <span data-label="№ з/п:">{index + 1}</span>
                                                <span data-label="Найменування:" className="vd-item-name">
                                                    {canEdit && isEditing ? (
                                                        <input
                                                            type="text"
                                                            className="vd-input"
                                                            value={item.name || ''}
                                                            onChange={(e) => patchItemLocal(item.id, 'name', e.target.value)}
                                                            onBlur={(e) => handleItemFieldChange(item.id, 'name', e.target.value)}
                                                        />
                                                    ) : item.name}
                                                </span>
                                                <span data-label="Одиниці виміру:">
                                                    {canEdit && isEditing ? (
                                                        <input
                                                            type="text"
                                                            className="vd-input"
                                                            value={item.unit || ''}
                                                            onChange={(e) => patchItemLocal(item.id, 'unit', e.target.value)}
                                                            onBlur={(e) => handleItemFieldChange(item.id, 'unit', e.target.value)}
                                                        />
                                                    ) : (item.unit || '—')}
                                                </span>
                                                <span data-label="Необхідно згідно наказу:">
                                                    {canEdit && isEditing ? (
                                                        <input
                                                            type="text"
                                                            className="vd-input"
                                                            title="Число або текст: «Відповідно до ТУ», «1х100», «3****»"
                                                            value={item.requiredText || ''}
                                                            onChange={(e) => patchItemLocal(item.id, 'requiredText', e.target.value)}
                                                            onBlur={(e) => handleItemFieldChange(item.id, 'requiredText', e.target.value)}
                                                        />
                                                    ) : (item.requiredText || '-')}
                                                </span>
                                                <span data-label="Знаходиться на автомобілі:">
                                                    {canEdit && isEditing ? (
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            className="vd-input"
                                                            value={item.actualQuantity ?? ''}
                                                            {...numericField({
                                                                key: `item-${item.id}-actual`,
                                                                value: item.actualQuantity ?? 0,
                                                                setLocal: (v) => patchItemLocal(item.id, 'actualQuantity', v),
                                                                save: (v) => handleItemFieldChange(item.id, 'actualQuantity', v),
                                                            })}
                                                        />
                                                    ) : (item.actualQuantity ?? 0)}
                                                </span>
                                                <span data-label="Некомплект на автомобілі:" className={shortage ? 'vd-shortage' : ''}>
                                                    {shortage === null ? '-' : shortage}
                                                </span>
                                                {canEdit && isEditing && (
                                                    <span data-label="Дії:">
                                                        <button className="vd-delete-btn" onClick={() => handleDeleteItem(item.id)} title="Видалити">
                                                            <MdDelete size={18} />
                                                        </button>
                                                    </span>
                                                )}
                                            </div>
                                            )
                                        })}

                                        {visibleItems.length === 0 && (
                                            <div className="vd-empty">
                                                {items.length === 0 ? 'Опис ще порожній' : 'Нічого не знайдено'}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── Add inventory row ── */}
                                {canEdit && isEditing && (
                                    <div className="vd-add-item">
                                        <div className="vd-add-head">
                                            <h4>Додати позицію до опису</h4>
                                            <button
                                                className="vd-btn-standard"
                                                onClick={handleFillStandard}
                                                title="Додати позиції нормативу типу техніки, яких ще немає в описі"
                                            >
                                                Підтягнути норматив
                                            </button>
                                        </div>
                                        {items.length === 0 && (
                                            <p className="vd-hint">
                                                Опис порожній. Натисніть «Підтягнути норматив» — позиції за типом техніки
                                                підставляться з НОРМА-3, а наявність внесете самі.
                                            </p>
                                        )}
                                        <div className="vd-add-form">
                                            <input
                                                type="text"
                                                value={newItem.name}
                                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                                                placeholder="Найменування"
                                            />
                                            <input
                                                type="text"
                                                value={newItem.unit}
                                                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                                                placeholder="Од."
                                                className="vd-input-small"
                                            />
                                            <input
                                                type="text"
                                                value={newItem.requiredText}
                                                onChange={(e) => setNewItem({ ...newItem, requiredText: e.target.value })}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                                                placeholder="Необхідно згідно наказу"
                                                title="Число або текст: «Відповідно до ТУ», «1х100», «3****»"
                                            />
                                            <input
                                                type="number"
                                                min="0"
                                                value={newItem.actualQuantity}
                                                onChange={(e) => setNewItem({ ...newItem, actualQuantity: e.target.value })}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                                                placeholder="Знаходиться на авто"
                                            />
                                            <button className="vd-btn-add" onClick={handleAddItem}>
                                                <MdAdd size={20} /> Додати
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                </div>
            )}
        </div>
    )
}

export default VehicleDescriptions
