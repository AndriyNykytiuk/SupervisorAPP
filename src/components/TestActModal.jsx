import React, { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import html2pdf from 'html2pdf.js'
import { MdClose, MdDeleteOutline } from 'react-icons/md'
import { ACT_ROWS, ACT_NOTE_TEMPLATE } from '../constants/testAct.js'
import '../scss/testactmodal.scss'

// Реквізити (номер, підрозділ, комісія) вводяться перед друком і в БД не зберігаються —
// між актами підставляються з localStorage. Той самий патерн, що й у VehicleDescriptions.
const STORAGE_KEY = 'test-act-print-requisites'

// Голова й кожен член комісії мають однакову структуру бланка: посада (кілька рядків),
// звання, ПІБ — звання й ПІБ друкуються в один рядок (звання зліва, ПІБ праворуч).
const EMPTY_PERSON = { position: '', rank: '', name: '' }

const DEFAULTS = {
    regNumber: '',
    actDate: new Date().toISOString().slice(0, 10),
    unitShortName: '',
    testingSubdivision: '',
    orderIssuer: '',
    orderDate: '',
    orderNumber: '',
    chairman: { ...EMPTY_PERSON },
    members: [{ ...EMPTY_PERSON }],
    noteText: ACT_NOTE_TEMPLATE,
}

const loadRequisites = () => {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
        return { ...DEFAULTS, ...saved }
    } catch {
        return { ...DEFAULTS }
    }
}

const escapeHtml = (s) => String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const multilineHtml = (s) => String(s ?? '')
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => `<div>${escapeHtml(line.trim())}</div>`)
    .join('')

const formatDate = (dateString) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('uk-UA')
}

const labelOf = (item) => item.inventoryNumber || item.name

// Рахує рядок акта для однієї категорії з елементів, доданих до чернетки.
const buildRow = (config, items, failReasons) => {
    if (items.length === 0) {
        return { ...config, qty: '-', invNumbers: '-', resultText: '-', dateText: '-' }
    }
    const qty = items.length
    const invNumbers = items.map(labelOf).join(', ')
    const dateText = formatDate(items[0].testDate)

    if (config.fixedResultLabel) {
        return { ...config, qty, invNumbers, resultText: config.fixedResultLabel, dateText }
    }

    const pass = items.filter((i) => i.result !== 'fail')
    const fail = items.filter((i) => i.result === 'fail')
    let resultText
    if (fail.length === 0) {
        resultText = 'Придатний'
    } else {
        const parts = []
        if (pass.length) parts.push(`Придатний ${pass.map(labelOf).join(', ')}`)
        parts.push(`Непридатний ${fail.map((i) => {
            const reason = failReasons[i.id]?.trim()
            return `${labelOf(i)}${reason ? ` (${reason})` : ''}`
        }).join('; ')}`)
        resultText = parts.join('; ')
    }
    return { ...config, qty, invNumbers, resultText, dateText }
}

// testLists: повний масив із вкладеними TestItems (той самий, що вже завантажений на сторінці).
// actItemIds: id обраних TestItem, незалежно від категорії.
const TestActModal = ({ testLists, actItemIds, onRemoveItem, onClose, onFormed }) => {
    const [requisites, setRequisites] = useState(loadRequisites)
    const [isGenerating, setIsGenerating] = useState(false)

    const idSet = useMemo(() => new Set(actItemIds), [actItemIds])

    // Усі обрані елементи (для списку зверху й для полів причини непридатності)
    const draftItems = useMemo(() => {
        const out = []
        for (const list of testLists || []) {
            for (const item of list.TestItems || []) {
                if (idSet.has(item.id)) out.push({ ...item, testListName: list.name })
            }
        }
        return out
    }, [testLists, idSet])

    const failedItems = draftItems.filter((i) => i.result === 'fail')
    const [failReasons, setFailReasons] = useState({})

    const rows = useMemo(() => {
        return ACT_ROWS.map((config) => {
            const items = config.testListId
                ? draftItems.filter((i) => i.testListId === config.testListId)
                : []
            return buildRow(config, items, failReasons)
        })
    }, [draftItems, failReasons])

    const ptoRows = rows.filter((r) => r.group === 'pto')
    const towerRows = rows.filter((r) => r.group === 'tower')

    const setField = (field, value) => setRequisites((prev) => ({ ...prev, [field]: value }))

    const setChairmanField = (field, value) => setRequisites((prev) => ({ ...prev, chairman: { ...prev.chairman, [field]: value } }))
    const setMemberField = (idx, field, value) => setRequisites((prev) => ({
        ...prev,
        members: prev.members.map((m, i) => (i === idx ? { ...m, [field]: value } : m)),
    }))
    const addMember = () => setRequisites((prev) => ({ ...prev, members: [...prev.members, { ...EMPTY_PERSON }] }))
    const removeMember = (idx) => setRequisites((prev) => ({ ...prev, members: prev.members.filter((_, i) => i !== idx) }))

    const cell = 'border: 1px solid #000; padding: 2px 4px; font-size: 10px; vertical-align: middle;'
    const head = 'border: 1px solid #000; padding: 3px 4px; font-weight: 700; text-align: center; vertical-align: middle; font-size: 9px;'

    const buildPtoRowsHtml = () => ptoRows.map((r, i) => `
        <tr>
            <td style="${cell} text-align: center;">${i + 1}</td>
            <td style="${cell}">${escapeHtml(r.printName)}</td>
            <td style="${cell} text-align: center;">${escapeHtml(r.qty)}</td>
            <td style="${cell} text-align: center;">${escapeHtml(r.invNumbers)}</td>
            ${i === 0 ? `<td style="${cell} text-align: center;" rowspan="${ptoRows.length}">${multilineHtml(requisites.testingSubdivision)}</td>` : ''}
            <td style="${cell} white-space: pre-line;">${escapeHtml(r.testSpec)}</td>
            <td style="${cell}">${escapeHtml(r.resultText)}</td>
            <td style="${cell} text-align: center;">${escapeHtml(r.dateText)}</td>
        </tr>`).join('')

    const buildTowerRowsHtml = () => towerRows.map((r, i) => `
        <tr>
            <td style="${cell} text-align: center;">${i + 1}</td>
            <td style="${cell}">${escapeHtml(r.printName)}</td>
            <td style="${cell} text-align: center;">${escapeHtml(r.qty)}</td>
            <td style="${cell} white-space: pre-line;">${escapeHtml(r.testSpec)}</td>
            <td style="${cell}">${escapeHtml(r.resultText)}</td>
            <td style="${cell} text-align: center;">${escapeHtml(r.dateText)}</td>
        </tr>`).join('')

    const handleGenerate = () => {
        if (failedItems.some((i) => !failReasons[i.id]?.trim())) {
            toast.error('Вкажіть причину для кожної непридатної позиції')
            return
        }

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(requisites))
        } catch {
            // приватний режим — просто не запам'ятовуємо
        }

        setIsGenerating(true)

        // Голова/член комісії: посада в кілька рядків, звання й ПІБ — один рядок
        // (звання зліва, ПІБ праворуч), точно як у паперовому бланку.
        const personHtml = (person) => `
            ${multilineHtml(person.position)}
            <table style="width: 100%; table-layout: fixed; border-collapse: collapse;">
                <tr>
                    <td style="text-align: left; vertical-align: top;">${escapeHtml(person.rank)}</td>
                    <td style="text-align: right; vertical-align: top;">${escapeHtml(person.name)}</td>
                </tr>
            </table>`

        const html = `
        <div style="font-family: 'Times New Roman', serif; padding: 10px 16px; color: #000; font-size: 13px; line-height: 1.25;">
            <div>Реєстраційний номер ${escapeHtml(requisites.regNumber || '____')} від ${formatDate(requisites.actDate)}</div>

            <div style="text-align: center; font-weight: 700; margin: 10px 0 2px;">АКТ</div>
            <div style="text-align: center; margin-bottom: 10px;">
                випробовування пожежно-технічного обладнання ${escapeHtml(requisites.unitShortName)}
            </div>

            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="${head} width: 18px;">№<br/>п/п</th>
                        <th style="${head}">Найменування ПТО</th>
                        <th style="${head} width: 32px;">Кількість, шт.</th>
                        <th style="${head} width: 48px;">Інвентарний №</th>
                        <th style="${head} width: 58px;">Підрозділ випробування</th>
                        <th style="${head} width: 60px;">Величина випробування</th>
                        <th style="${head} width: 92px;">Результат випробування (придатний/непридатний причина)</th>
                        <th style="${head} width: 42px;">Дата випробування</th>
                    </tr>
                </thead>
                <tbody>${buildPtoRowsHtml()}</tbody>
            </table>

            ${towerRows.length ? `
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                    <tr><th colspan="6" style="${head}">Навчальна башта</th></tr>
                    <tr>
                        <th style="${head} width: 18px;">№<br/>п/п</th>
                        <th style="${head}">Найменування</th>
                        <th style="${head} width: 32px;">Кількість, шт.</th>
                        <th style="${head}">Перелік виконаних робіт/величина випробування</th>
                        <th style="${head} width: 78px;">Результат випробування/виконаних робіт</th>
                        <th style="${head} width: 46px;">Дата випробування/виконаних робіт</th>
                    </tr>
                </thead>
                <tbody>${buildTowerRowsHtml()}</tbody>
            </table>` : ''}

            ${(requisites.orderIssuer || requisites.orderNumber || requisites.chairman.name) ? `
            <div style="margin-top: 14px;">
                Комісія, призначена наказом ${escapeHtml(requisites.orderIssuer)} від ${escapeHtml(requisites.orderDate)} року
                № ${escapeHtml(requisites.orderNumber)} «Про створення Комісії по випробуванню пожежно-технічного обладнання», в складі:
            </div>
            <div style="margin-top: 10px;">
                <div>Голова комісії:</div>
                ${personHtml(requisites.chairman)}
            </div>
            ${requisites.members.some((m) => m.name || m.position || m.rank) ? `
            <div style="margin-top: 10px;">
                <div>Члени комісії:</div>
                ${requisites.members.map((m) => personHtml(m)).join('<div style="height: 8px;"></div>')}
            </div>` : ''}` : ''}

            ${requisites.noteText.trim() ? `
            <div style="margin-top: 14px; font-style: italic; text-align: justify;">${escapeHtml(requisites.noteText)}</div>` : ''}
        </div>`

        const container = document.createElement('div')
        container.innerHTML = html
        document.body.appendChild(container)

        html2pdf()
            .set({
                margin: [0.4, 0.25, 0.4, 0.25],
                filename: `Акт_випробування_ПТО_${requisites.unitShortName || 'частина'}_${requisites.actDate}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['css', 'legacy'], avoid: 'tr' },
            })
            .from(container)
            .outputPdf('bloburl')
            .then((url) => {
                document.body.removeChild(container)
                setIsGenerating(false)
                window.open(url, '_blank')
                onFormed()
            })
            .catch((err) => {
                document.body.removeChild(container)
                setIsGenerating(false)
                console.error('Failed to generate act PDF:', err)
                toast.error('Не вдалося сформувати акт')
            })
    }

    return (
        <div className="ta-modal-overlay" onClick={onClose}>
            <div className="ta-modal" onClick={(e) => e.stopPropagation()}>
                <div className="ta-modal-header">
                    <h3>Акт випробування ПТО ({draftItems.length} поз.)</h3>
                    <button type="button" onClick={onClose}><MdClose /></button>
                </div>
                <div className="ta-modal-body">
                    <p className="ta-hint">
                        Реквізити зберігаються у цьому браузері, тож наступного разу вводити не доведеться.
                        Перелік нижче — те, що вже додано кнопкою «Додати до акту» в списках ПТО.
                    </p>

                    <div className="ta-draft-list">
                        {draftItems.length === 0 && <p className="ta-empty">Нічого не додано</p>}
                        {draftItems.map((item) => (
                            <div key={item.id} className="ta-draft-row">
                                <span className="ta-draft-cat">{item.testListName}</span>
                                <span className="ta-draft-name">{labelOf(item)}</span>
                                <span className={`ta-draft-result ${item.result === 'fail' ? 'fail' : ''}`}>
                                    {item.result === 'pass' ? 'Придатний' : item.result === 'fail' ? 'Непридатний' : item.result || '—'}
                                </span>
                                <button type="button" className="ta-draft-remove" onClick={() => onRemoveItem(item.id)} title="Прибрати з акту">
                                    <MdDeleteOutline />
                                </button>
                            </div>
                        ))}
                    </div>

                    {failedItems.length > 0 && (
                        <>
                            <div className="ta-modal-section">Причини непридатності</div>
                            {failedItems.map((item) => (
                                <div key={item.id} className="ta-modal-row">
                                    <label style={{ flex: '0 0 auto', alignSelf: 'center' }}>{labelOf(item)}</label>
                                    <input
                                        type="text"
                                        value={failReasons[item.id] || ''}
                                        onChange={(e) => setFailReasons((prev) => ({ ...prev, [item.id]: e.target.value }))}
                                        placeholder="Напр. розриви окремих ниток, залишкове подовження 30 %"
                                    />
                                </div>
                            ))}
                        </>
                    )}

                    <div className="ta-modal-section">Реквізити</div>
                    <div className="ta-modal-row">
                        <div>
                            <label>Реєстраційний номер</label>
                            <input type="text" value={requisites.regNumber} onChange={(e) => setField('regNumber', e.target.value)} placeholder="18" />
                        </div>
                        <div>
                            <label>Дата акта</label>
                            <input type="date" value={requisites.actDate} onChange={(e) => setField('actDate', e.target.value)} />
                        </div>
                    </div>
                    <label>Назва частини в заголовку</label>
                    <input type="text" value={requisites.unitShortName} onChange={(e) => setField('unitShortName', e.target.value)} placeholder="2 ДПРЧ (м. Рівне) 3 ДПРЗ" />

                    <label>Підрозділ випробування — кожен рядок друкується окремо (Enter = перенос)</label>
                    <textarea rows="3" value={requisites.testingSubdivision} onChange={(e) => setField('testingSubdivision', e.target.value)}
                        placeholder={'2 ДПРЧ (м. Рівне) 3 ДПРЗ\nГУ ДСНС України у Рівненській області'} />

                    <div className="ta-modal-section">Наказ про комісію</div>
                    <div className="ta-modal-row">
                        <div>
                            <label>Хто видав</label>
                            <input type="text" value={requisites.orderIssuer} onChange={(e) => setField('orderIssuer', e.target.value)} placeholder="АРЗ СП ГУ ДСНС України у Рівненській області" />
                        </div>
                        <div>
                            <label>Дата наказу</label>
                            <input type="text" value={requisites.orderDate} onChange={(e) => setField('orderDate', e.target.value)} placeholder="31.10.2024" />
                        </div>
                        <div>
                            <label>№ наказу</label>
                            <input type="text" value={requisites.orderNumber} onChange={(e) => setField('orderNumber', e.target.value)} placeholder="НС-363/62 30" />
                        </div>
                    </div>

                    <div className="ta-modal-section">Голова комісії</div>
                    <label>Посада — кожен рядок друкується окремо (Enter = перенос)</label>
                    <textarea rows="2" value={requisites.chairman.position} onChange={(e) => setChairmanField('position', e.target.value)}
                        placeholder={'Заступник начальника ЧЗ АРЗ СП\nГУ ДСНС України у Рівненській області'} />
                    <div className="ta-modal-row">
                        <div>
                            <label>Звання</label>
                            <input type="text" value={requisites.chairman.rank} onChange={(e) => setChairmanField('rank', e.target.value)} placeholder="ст. лейтенант служби цивільного захисту" />
                        </div>
                        <div>
                            <label>Ім'я та ПРІЗВИЩЕ</label>
                            <input type="text" value={requisites.chairman.name} onChange={(e) => setChairmanField('name', e.target.value)} placeholder="Дмитро ВЕРЕМЕЄНКО" />
                        </div>
                    </div>

                    <div className="ta-modal-section">
                        Члени комісії
                        <button type="button" className="ta-link-btn" onClick={addMember}>+ додати члена</button>
                    </div>
                    {requisites.members.map((member, idx) => (
                        <div key={idx} className="ta-member-block">
                            <label>Посада — кожен рядок друкується окремо (Enter = перенос)</label>
                            <textarea rows="2" value={member.position} onChange={(e) => setMemberField(idx, 'position', e.target.value)}
                                placeholder={'Технік відділення ремонту пожежних рукавів\nремонтної групи частини забезпечення АРЗ СП'} />
                            <div className="ta-modal-row">
                                <div>
                                    <label>Звання</label>
                                    <input type="text" value={member.rank} onChange={(e) => setMemberField(idx, 'rank', e.target.value)} placeholder="технік" />
                                </div>
                                <div>
                                    <label>Ім'я та ПРІЗВИЩЕ</label>
                                    <input type="text" value={member.name} onChange={(e) => setMemberField(idx, 'name', e.target.value)} placeholder="Костянтин ШВЕДОВ" />
                                </div>
                            </div>
                            {requisites.members.length > 1 && (
                                <button type="button" className="ta-link-btn ta-link-btn--danger" onClick={() => removeMember(idx)}>прибрати члена</button>
                            )}
                        </div>
                    ))}

                    <div className="ta-modal-section">
                        Примітка
                        <button type="button" className="ta-link-btn" onClick={() => setField('noteText', ACT_NOTE_TEMPLATE)}>повернути шаблон</button>
                    </div>
                    <textarea rows="3" value={requisites.noteText} onChange={(e) => setField('noteText', e.target.value)} />

                    <div className="ta-modal-actions">
                        <button type="button" className="ta-btn-ghost" onClick={onClose}>Скасувати</button>
                        <button type="button" className="ta-btn-add" onClick={handleGenerate} disabled={isGenerating || draftItems.length === 0}>
                            {isGenerating ? 'Формування…' : 'Сформувати акт'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TestActModal
