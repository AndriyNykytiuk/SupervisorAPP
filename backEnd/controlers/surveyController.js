import { randomUUID } from 'crypto'
import sequelize from '../config/db.js'
import {
    SurveyForm,
    SurveyResponse,
    Brigade,
    User,
} from '../models/index.js'

const QUESTION_TYPES = ['number', 'presence', 'state', 'text', 'photo']

// ── Helpers ─────────────────────────────────────────────

function normalizeQuestions(raw) {
    if (!Array.isArray(raw)) {
        const err = new Error('questions має бути масивом')
        err.status = 400
        throw err
    }
    return raw.map((q, idx) => {
        if (!q || typeof q !== 'object') {
            const err = new Error(`Питання #${idx + 1}: некоректний формат`)
            err.status = 400
            throw err
        }
        const type = String(q.type || '').trim()
        if (!QUESTION_TYPES.includes(type)) {
            const err = new Error(
                `Питання #${idx + 1}: тип "${type}" недопустимий (${QUESTION_TYPES.join(', ')})`
            )
            err.status = 400
            throw err
        }
        const label = String(q.label || '').trim()
        if (!label) {
            const err = new Error(`Питання #${idx + 1}: назва обовʼязкова`)
            err.status = 400
            throw err
        }
        const config = q.config && typeof q.config === 'object' ? q.config : {}
        if (type === 'state') {
            const options = Array.isArray(config.options)
                ? config.options.map((o) => String(o).trim()).filter(Boolean)
                : []
            if (options.length === 0) {
                const err = new Error(
                    `Питання #${idx + 1} (стан): потрібно вказати хоча б один варіант`
                )
                err.status = 400
                throw err
            }
            config.options = options
        }
        return {
            id: q.id ? String(q.id) : randomUUID(),
            order: Number.isFinite(Number(q.order)) ? Number(q.order) : idx,
            label,
            type,
            required: q.required === true,
            config,
        }
    })
}

async function loadFullSurvey(id) {
    return SurveyForm.findByPk(id)
}

function aggregateAnswers(questions, responses) {
    return questions.map((q) => {
        const values = responses
            .map((r) => ({
                brigadeId: r.brigadeId,
                brigadeName: r.brigadeName,
                value: r.answers?.[q.id],
            }))
            .filter((v) => v.value !== undefined && v.value !== null)

        const base = {
            questionId: q.id,
            label: q.label,
            type: q.type,
            answeredCount: values.length,
        }

        if (q.type === 'number') {
            const nums = values
                .map((v) => Number(v.value?.number))
                .filter((n) => Number.isFinite(n))
            const sum = nums.reduce((a, b) => a + b, 0)
            return {
                ...base,
                sum,
                avg: nums.length ? sum / nums.length : 0,
                min: nums.length ? Math.min(...nums) : null,
                max: nums.length ? Math.max(...nums) : null,
                byBrigade: values.map((v) => ({
                    brigadeId: v.brigadeId,
                    brigadeName: v.brigadeName,
                    number: Number(v.value?.number),
                })),
            }
        }

        if (q.type === 'presence') {
            let trueCount = 0
            let falseCount = 0
            for (const v of values) {
                if (v.value?.presence === true) trueCount += 1
                else if (v.value?.presence === false) falseCount += 1
            }
            return { ...base, trueCount, falseCount }
        }

        if (q.type === 'state') {
            const counts = {}
            for (const opt of q.config?.options || []) counts[opt] = 0
            for (const v of values) {
                const s = v.value?.state
                if (s != null) counts[s] = (counts[s] || 0) + 1
            }
            return {
                ...base,
                counts,
                byBrigade: values.map((v) => ({
                    brigadeId: v.brigadeId,
                    brigadeName: v.brigadeName,
                    state: v.value?.state ?? null,
                })),
            }
        }

        if (q.type === 'text') {
            return {
                ...base,
                values: values.map((v) => ({
                    brigadeId: v.brigadeId,
                    brigadeName: v.brigadeName,
                    text: v.value?.text ?? '',
                })),
            }
        }

        if (q.type === 'photo') {
            return {
                ...base,
                photos: values.map((v) => ({
                    brigadeId: v.brigadeId,
                    brigadeName: v.brigadeName,
                    urls: Array.isArray(v.value?.photos) ? v.value.photos : [],
                })),
            }
        }

        return base
    })
}

function normalizeAnswers(questions, raw) {
    const out = {}
    if (!raw || typeof raw !== 'object') return out
    for (const q of questions) {
        const v = raw[q.id]
        if (v === undefined || v === null) continue
        if (q.type === 'number') {
            const n = Number(v.number ?? v)
            if (Number.isFinite(n)) out[q.id] = { number: n }
        } else if (q.type === 'presence') {
            const b = typeof v === 'object' ? v.presence : v
            if (typeof b === 'boolean') out[q.id] = { presence: b }
        } else if (q.type === 'state') {
            const s = typeof v === 'object' ? v.state : v
            if (typeof s === 'string' && s.trim()) {
                const allowed = q.config?.options || []
                if (!allowed.length || allowed.includes(s)) {
                    out[q.id] = { state: s }
                }
            }
        } else if (q.type === 'text') {
            const t = typeof v === 'object' ? v.text : v
            if (typeof t === 'string') out[q.id] = { text: t }
        } else if (q.type === 'photo') {
            const arr = Array.isArray(v) ? v : Array.isArray(v.photos) ? v.photos : []
            out[q.id] = {
                photos: arr.map((u) => String(u)).filter(Boolean),
            }
        }
    }
    return out
}

function isGod(req) {
    return req.user?.role === 'GOD'
}

// ── Surveys ─────────────────────────────────────────────

export const getAllSurveys = async (req, res, next) => {
    try {
        const where = isGod(req) ? {} : { status: 'open' }
        const surveys = await SurveyForm.findAll({
            where,
            order: [['createdAt', 'DESC']],
        })

        const brigadeId = req.user?.brigadeId || null
        const ids = surveys.map((s) => s.id)

        // Response counts for all listed surveys (single query)
        const responses = ids.length
            ? await SurveyResponse.findAll({
                  where: { surveyFormId: ids },
                  attributes: ['id', 'surveyFormId', 'brigadeId', 'updatedAt'],
              })
            : []

        const byForm = new Map()
        for (const r of responses) {
            if (!byForm.has(r.surveyFormId)) byForm.set(r.surveyFormId, [])
            byForm.get(r.surveyFormId).push(r)
        }

        const payload = surveys.map((s) => {
            const list = byForm.get(s.id) || []
            const mine = brigadeId
                ? list.find((r) => r.brigadeId === Number(brigadeId))
                : null
            return {
                ...s.toJSON(),
                responseCount: list.length,
                myResponseId: mine?.id || null,
                myResponseUpdatedAt: mine?.updatedAt || null,
            }
        })

        res.json(payload)
    } catch (err) {
        next(err)
    }
}

export const getSurveyById = async (req, res, next) => {
    try {
        const survey = await SurveyForm.findByPk(req.params.id)
        if (!survey) return res.status(404).json({ error: 'Форму не знайдено' })

        if (!isGod(req) && survey.status === 'closed') {
            return res.status(403).json({ error: 'Форма закрита' })
        }

        const brigadeId = req.user?.brigadeId || null
        const myResponse = brigadeId
            ? await SurveyResponse.findOne({
                  where: { surveyFormId: survey.id, brigadeId },
              })
            : null

        res.json({
            ...survey.toJSON(),
            myResponse: myResponse ? myResponse.toJSON() : null,
        })
    } catch (err) {
        next(err)
    }
}

export const createSurvey = async (req, res, next) => {
    try {
        const { title, description, questions, deadline } = req.body
        if (!title || !String(title).trim()) {
            return res.status(400).json({ error: 'Поле "назва" обовʼязкове' })
        }
        const normQuestions = normalizeQuestions(questions || [])
        if (normQuestions.length === 0) {
            return res.status(400).json({ error: 'Додайте хоча б одне питання' })
        }

        const survey = await SurveyForm.create({
            title: String(title).trim(),
            description: description ? String(description) : null,
            questions: normQuestions,
            deadline: deadline ? new Date(deadline) : null,
            status: 'open',
            createdByUserId: req.user?.id || null,
            createdByUserName: req.user?.name || null,
        })

        res.status(201).json(survey)
    } catch (err) {
        if (err.status) return res.status(err.status).json({ error: err.message })
        next(err)
    }
}

export const updateSurvey = async (req, res, next) => {
    try {
        const survey = await SurveyForm.findByPk(req.params.id)
        if (!survey) return res.status(404).json({ error: 'Форму не знайдено' })
        if (survey.status === 'closed') {
            return res.status(403).json({ error: 'Форма закрита — редагування заборонене' })
        }

        const { title, description, deadline, questions } = req.body
        const patch = {}
        if (title !== undefined) {
            if (!String(title).trim()) {
                return res.status(400).json({ error: 'Поле "назва" обовʼязкове' })
            }
            patch.title = String(title).trim()
        }
        if (description !== undefined) {
            patch.description = description ? String(description) : null
        }
        if (deadline !== undefined) {
            patch.deadline = deadline ? new Date(deadline) : null
        }

        // Questions can only be changed if there are no responses yet
        if (questions !== undefined) {
            const count = await SurveyResponse.count({ where: { surveyFormId: survey.id } })
            if (count > 0) {
                return res.status(409).json({
                    error: 'Не можна змінювати питання — вже є відповіді',
                })
            }
            const normQuestions = normalizeQuestions(questions)
            if (normQuestions.length === 0) {
                return res.status(400).json({ error: 'Додайте хоча б одне питання' })
            }
            patch.questions = normQuestions
        }

        await survey.update(patch)
        res.json(survey)
    } catch (err) {
        if (err.status) return res.status(err.status).json({ error: err.message })
        next(err)
    }
}

export const closeSurvey = async (req, res, next) => {
    try {
        const survey = await SurveyForm.findByPk(req.params.id)
        if (!survey) return res.status(404).json({ error: 'Форму не знайдено' })
        if (survey.status === 'closed') {
            return res.status(400).json({ error: 'Форма вже закрита' })
        }
        await survey.update({ status: 'closed', closedAt: new Date() })
        res.json(survey)
    } catch (err) {
        next(err)
    }
}

export const deleteSurvey = async (req, res, next) => {
    try {
        const survey = await SurveyForm.findByPk(req.params.id)
        if (!survey) return res.status(404).json({ error: 'Форму не знайдено' })
        await survey.destroy()
        res.status(204).end()
    } catch (err) {
        next(err)
    }
}

// ── Responses ───────────────────────────────────────────

export const upsertResponse = async (req, res, next) => {
    const t = await sequelize.transaction()
    try {
        const survey = await SurveyForm.findByPk(req.params.id, { transaction: t })
        if (!survey) {
            await t.rollback()
            return res.status(404).json({ error: 'Форму не знайдено' })
        }
        if (survey.status !== 'open') {
            await t.rollback()
            return res.status(403).json({ error: 'Форма закрита' })
        }

        const brigadeId = req.user?.brigadeId
        if (!brigadeId) {
            await t.rollback()
            return res.status(400).json({
                error: 'Користувач не належить до частини — не може відповідати',
            })
        }

        const brigade = await Brigade.findByPk(brigadeId, { transaction: t })
        const normAnswers = normalizeAnswers(survey.questions || [], req.body?.answers)

        const existing = await SurveyResponse.findOne({
            where: { surveyFormId: survey.id, brigadeId },
            transaction: t,
        })

        let response
        if (existing) {
            await existing.update(
                {
                    brigadeName: brigade?.name || existing.brigadeName,
                    submittedByUserId: req.user?.id || null,
                    submittedByUserName: req.user?.name || null,
                    answers: normAnswers,
                },
                { transaction: t }
            )
            response = existing
        } else {
            response = await SurveyResponse.create(
                {
                    surveyFormId: survey.id,
                    brigadeId,
                    brigadeName: brigade?.name || null,
                    submittedByUserId: req.user?.id || null,
                    submittedByUserName: req.user?.name || null,
                    answers: normAnswers,
                },
                { transaction: t }
            )
        }

        await t.commit()
        res.status(existing ? 200 : 201).json(response)
    } catch (err) {
        await t.rollback()
        next(err)
    }
}

export const getSurveyResponses = async (req, res, next) => {
    try {
        const survey = await SurveyForm.findByPk(req.params.id)
        if (!survey) return res.status(404).json({ error: 'Форму не знайдено' })

        const responses = await SurveyResponse.findAll({
            where: { surveyFormId: survey.id },
            include: [{ model: Brigade, attributes: ['id', 'name'] }],
            order: [['updatedAt', 'DESC']],
        })

        const allBrigades = await Brigade.findAll({ attributes: ['id', 'name'] })
        const answeredIds = new Set(responses.map((r) => r.brigadeId))
        const notAnswered = allBrigades
            .filter((b) => !answeredIds.has(b.id))
            .map((b) => ({ id: b.id, name: b.name }))

        res.json({
            surveyId: survey.id,
            totalBrigades: allBrigades.length,
            answeredCount: responses.length,
            responses,
            notAnswered,
        })
    } catch (err) {
        next(err)
    }
}

function csvEscape(value) {
    if (value === null || value === undefined) return ''
    const s = String(value)
    if (/[",;\n\r]/.test(s)) {
        return `"${s.replace(/"/g, '""')}"`
    }
    return s
}

function answerToCell(q, ans) {
    if (!ans) return ''
    if (q.type === 'number') return ans.number ?? ''
    if (q.type === 'presence') {
        if (ans.presence === true) return 'Так'
        if (ans.presence === false) return 'Ні'
        return ''
    }
    if (q.type === 'state') return ans.state ?? ''
    if (q.type === 'text') return ans.text ?? ''
    if (q.type === 'photo') {
        const n = Array.isArray(ans.photos) ? ans.photos.length : 0
        return `${n} фото`
    }
    return ''
}

export const exportSurveyCsv = async (req, res, next) => {
    try {
        const survey = await SurveyForm.findByPk(req.params.id)
        if (!survey) return res.status(404).json({ error: 'Форму не знайдено' })

        const responses = await SurveyResponse.findAll({
            where: { surveyFormId: survey.id },
            include: [{ model: Brigade, attributes: ['id', 'name'] }],
            order: [['updatedAt', 'DESC']],
        })

        const questions = survey.questions || []
        const headers = [
            'Частина',
            'Хто заповнив',
            'Оновлено',
            ...questions.map((q) => q.label),
        ]

        const rows = responses.map((r) => [
            r.brigadeName || r.Brigade?.name || `#${r.brigadeId}`,
            r.submittedByUserName || '',
            r.updatedAt ? new Date(r.updatedAt).toISOString() : '',
            ...questions.map((q) => answerToCell(q, r.answers?.[q.id])),
        ])

        const csv = [headers, ...rows]
            .map((row) => row.map(csvEscape).join(','))
            .join('\r\n')

        const rawName =
            String(survey.title || 'survey')
                .toLowerCase()
                .replace(/[^\p{L}\p{N}]+/gu, '-')
                .replace(/^-+|-+$/g, '')
                .slice(0, 60) || 'survey'
        const utf8Name = `${rawName}-${survey.id}.csv`
        // ASCII fallback for Content-Disposition (HTTP headers must be ISO-8859-1)
        const asciiName = `survey-${survey.id}.csv`

        // BOM so Excel opens UTF-8 with Cyrillic correctly
        const body = '﻿' + csv
        res.setHeader('Content-Type', 'text/csv; charset=utf-8')
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(utf8Name)}`
        )
        res.send(body)
    } catch (err) {
        next(err)
    }
}

export const getSurveyAggregate = async (req, res, next) => {
    try {
        const survey = await SurveyForm.findByPk(req.params.id)
        if (!survey) return res.status(404).json({ error: 'Форму не знайдено' })

        const responses = await SurveyResponse.findAll({
            where: { surveyFormId: survey.id },
        })

        const perQuestion = aggregateAnswers(survey.questions || [], responses)
        res.json({
            surveyId: survey.id,
            totalResponses: responses.length,
            perQuestion,
        })
    } catch (err) {
        next(err)
    }
}
