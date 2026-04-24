import sequelize from '../config/db.js'
import {
    FireEvent,
    EventTeam,
    EventHistory,
    Brigade,
    User,
} from '../models/index.js'

async function logHistory(t, fireEventId, req, action, details) {
    await EventHistory.create(
        {
            fireEventId,
            userId: req.user?.id || null,
            userName: req.user?.name || null,
            action,
            details: details || null,
        },
        { transaction: t }
    )
}

async function loadFullEvent(id) {
    return FireEvent.findByPk(id, {
        include: [
            {
                model: EventTeam,
                include: [
                    { model: Brigade, attributes: ['id', 'name'] },
                    { model: User, as: 'SeniorUser', attributes: ['id', 'name'] },
                ],
            },
        ],
        order: [[EventTeam, 'createdAt', 'ASC']],
    })
}

// ── Events ──────────────────────────────────────────────

export const getAllEvents = async (req, res, next) => {
    try {
        const events = await FireEvent.findAll({
            include: [
                {
                    model: EventTeam,
                    include: [
                        { model: Brigade, attributes: ['id', 'name'] },
                        { model: User, as: 'SeniorUser', attributes: ['id', 'name'] },
                    ],
                },
            ],
            order: [['startTime', 'DESC']],
        })
        res.json(events)
    } catch (err) {
        next(err)
    }
}

export const getEventById = async (req, res, next) => {
    try {
        const event = await loadFullEvent(req.params.id)
        if (!event) return res.status(404).json({ error: 'Event not found' })
        res.json(event)
    } catch (err) {
        next(err)
    }
}

export const createEvent = async (req, res, next) => {
    const t = await sequelize.transaction()
    try {
        const { name, address, description, startTime } = req.body
        if (!name) {
            await t.rollback()
            return res.status(400).json({ error: 'Поле "назва" обовʼязкове' })
        }
        const event = await FireEvent.create(
            {
                name,
                address: address || null,
                description: description || null,
                startTime: startTime || new Date(),
                status: 'open',
                createdByUserId: req.user?.id || null,
                createdByUserName: req.user?.name || null,
            },
            { transaction: t }
        )
        await logHistory(t, event.id, req, 'event_created', {
            name: event.name,
            address: event.address,
        })
        await t.commit()
        const full = await loadFullEvent(event.id)
        res.status(201).json(full)
    } catch (err) {
        await t.rollback()
        next(err)
    }
}

export const updateEvent = async (req, res, next) => {
    const t = await sequelize.transaction()
    try {
        const event = await FireEvent.findByPk(req.params.id, { transaction: t })
        if (!event) {
            await t.rollback()
            return res.status(404).json({ error: 'Event not found' })
        }
        if (event.status === 'closed') {
            await t.rollback()
            return res.status(403).json({ error: 'Подія закрита — редагування заборонене' })
        }
        const { name, address, description, startTime } = req.body
        const allowed = { name, address, description, startTime }
        await event.update(allowed, { transaction: t })
        await logHistory(t, event.id, req, 'event_updated', allowed)
        await t.commit()
        const full = await loadFullEvent(event.id)
        res.json(full)
    } catch (err) {
        await t.rollback()
        next(err)
    }
}

export const closeEvent = async (req, res, next) => {
    const t = await sequelize.transaction()
    try {
        const event = await FireEvent.findByPk(req.params.id, { transaction: t })
        if (!event) {
            await t.rollback()
            return res.status(404).json({ error: 'Event not found' })
        }
        if (event.status === 'closed') {
            await t.rollback()
            return res.status(400).json({ error: 'Подія вже закрита' })
        }
        await event.update(
            { status: 'closed', endTime: new Date() },
            { transaction: t }
        )
        await logHistory(t, event.id, req, 'event_closed', { endTime: event.endTime })
        await t.commit()
        const full = await loadFullEvent(event.id)
        res.json(full)
    } catch (err) {
        await t.rollback()
        next(err)
    }
}

export const deleteEvent = async (req, res, next) => {
    try {
        const event = await FireEvent.findByPk(req.params.id)
        if (!event) return res.status(404).json({ error: 'Event not found' })
        await event.destroy()
        res.status(204).end()
    } catch (err) {
        next(err)
    }
}

// ── Teams ───────────────────────────────────────────────

export const addTeam = async (req, res, next) => {
    const t = await sequelize.transaction()
    try {
        const event = await FireEvent.findByPk(req.params.eventId, { transaction: t })
        if (!event) {
            await t.rollback()
            return res.status(404).json({ error: 'Event not found' })
        }
        if (event.status === 'closed') {
            await t.rollback()
            return res.status(403).json({ error: 'Подія закрита' })
        }
        const {
            brigadeId,
            locationName,
            seniorUserId,
            seniorNameText,
            peopleCount,
            vehicles,
            fuel,
            notes,
            equipment,
        } = req.body
        if (!brigadeId) {
            await t.rollback()
            return res.status(400).json({ error: 'Не вказано частину' })
        }
        const team = await EventTeam.create(
            {
                fireEventId: event.id,
                brigadeId,
                locationName: locationName || null,
                seniorUserId: seniorUserId || null,
                seniorNameText: seniorNameText || null,
                peopleCount: Number(peopleCount) || 0,
                vehicles: vehicles || null,
                fuel: fuel || null,
                notes: notes || null,
                equipment: Array.isArray(equipment) ? equipment : [],
            },
            { transaction: t }
        )
        const brigade = await Brigade.findByPk(brigadeId, { transaction: t })
        await logHistory(t, event.id, req, 'team_added', {
            teamId: team.id,
            brigadeId,
            brigadeName: brigade?.name,
            locationName: team.locationName,
            peopleCount: team.peopleCount,
        })
        await t.commit()
        const full = await loadFullEvent(event.id)
        res.status(201).json(full)
    } catch (err) {
        await t.rollback()
        next(err)
    }
}

export const updateTeam = async (req, res, next) => {
    const t = await sequelize.transaction()
    try {
        const team = await EventTeam.findByPk(req.params.teamId, { transaction: t })
        if (!team) {
            await t.rollback()
            return res.status(404).json({ error: 'Team not found' })
        }
        const event = await FireEvent.findByPk(team.fireEventId, { transaction: t })
        if (event.status === 'closed') {
            await t.rollback()
            return res.status(403).json({ error: 'Подія закрита' })
        }

        const oldCount = team.peopleCount
        const {
            locationName,
            seniorUserId,
            seniorNameText,
            peopleCount,
            vehicles,
            fuel,
            notes,
            equipment,
        } = req.body
        const updates = {
            locationName,
            seniorUserId: seniorUserId || null,
            seniorNameText: seniorNameText || null,
            peopleCount: peopleCount !== undefined ? Number(peopleCount) : team.peopleCount,
            vehicles,
            fuel,
            notes,
            equipment: Array.isArray(equipment) ? equipment : team.equipment,
        }
        await team.update(updates, { transaction: t })

        if (updates.peopleCount !== oldCount) {
            await logHistory(t, event.id, req, 'team_count_changed', {
                teamId: team.id,
                oldCount,
                newCount: updates.peopleCount,
            })
        } else {
            await logHistory(t, event.id, req, 'team_updated', {
                teamId: team.id,
            })
        }
        await t.commit()
        const full = await loadFullEvent(event.id)
        res.json(full)
    } catch (err) {
        await t.rollback()
        next(err)
    }
}

export const removeTeam = async (req, res, next) => {
    const t = await sequelize.transaction()
    try {
        const team = await EventTeam.findByPk(req.params.teamId, {
            include: [{ model: Brigade, attributes: ['id', 'name'] }],
            transaction: t,
        })
        if (!team) {
            await t.rollback()
            return res.status(404).json({ error: 'Team not found' })
        }
        const event = await FireEvent.findByPk(team.fireEventId, { transaction: t })
        if (event.status === 'closed') {
            await t.rollback()
            return res.status(403).json({ error: 'Подія закрита' })
        }
        const snapshot = {
            teamId: team.id,
            brigadeId: team.brigadeId,
            brigadeName: team.Brigade?.name,
            locationName: team.locationName,
            peopleCount: team.peopleCount,
        }
        await team.destroy({ transaction: t })
        await logHistory(t, event.id, req, 'team_removed', snapshot)
        await t.commit()
        const full = await loadFullEvent(event.id)
        res.json(full)
    } catch (err) {
        await t.rollback()
        next(err)
    }
}

// ── History ─────────────────────────────────────────────

export const getEventHistory = async (req, res, next) => {
    try {
        const history = await EventHistory.findAll({
            where: { fireEventId: req.params.eventId },
            order: [['createdAt', 'DESC']],
        })
        res.json(history)
    } catch (err) {
        next(err)
    }
}

export const getAllHistory = async (req, res, next) => {
    try {
        const history = await EventHistory.findAll({
            include: [
                {
                    model: FireEvent,
                    attributes: ['id', 'name', 'address', 'status'],
                },
            ],
            order: [['createdAt', 'DESC']],
            limit: 500,
        })
        res.json(history)
    } catch (err) {
        next(err)
    }
}
