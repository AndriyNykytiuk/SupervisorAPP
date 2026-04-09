# Error Handling Skill

## HTTP статус коди
200 → OK
201 → Created
204 → Deleted (no content)
400 → Bad Request (невалідні дані)
401 → Unauthorized (немає токена)
403 → Forbidden (немає прав)
404 → Not Found
409 → Conflict (дублікат)
500 → Server Error

## Стандартна відповідь помилки
{ "error": "повідомлення" }

## Перевірка обов'язкових полів
if (!req.body.name?.trim()) {
    return res.status(400).json({ error: 'name is required' })
}

## Обробка дублікатів Sequelize
  catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'Already exists' })
    }
    next(err)
}

## Global error handler (server.js)
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: err.message })
})