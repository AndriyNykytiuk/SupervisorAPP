import sequelize from '../config/db.js'

// Postgres не індексує зовнішні ключі автоматично, а Sequelize їх не додає.
// Без індексу кожен JOIN по FK і кожне каскадне видалення читають таблицю
// цілком. Проходимось по всіх FK схеми public і доіндексовуємо ті, що лишились
// без покриття. Ідемпотентно — виконується на кожному старті, нові моделі
// підхоплюються самі.
export async function ensureFkIndexes() {
    const [missing] = await sequelize.query(`
        SELECT c.conrelid::regclass::text AS table_name,
               array_agg(a.attname::text ORDER BY a.attnum) AS columns
        FROM pg_constraint c
        JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY (c.conkey)
        WHERE c.contype = 'f'
          AND c.connamespace = 'public'::regnamespace
          AND NOT EXISTS (
              SELECT 1 FROM pg_index i
              WHERE i.indrelid = c.conrelid AND a.attnum = ANY (i.indkey)
          )
        GROUP BY c.oid, c.conrelid
    `)

    const created = []
    for (const row of missing) {
        const table_name = row.table_name
        // node-postgres віддає text[] масивом, але підстрахуємось на випадок рядка «{a,b}»
        const columns = Array.isArray(row.columns)
            ? row.columns
            : String(row.columns).replace(/^\{|\}$/g, '').split(',').filter(Boolean)
        // Ім'я індексу: постгресівський ліміт — 63 байти
        const bare = table_name.replace(/"/g, '')
        const name = `${bare}_${columns.join('_')}_fk_idx`
            .replace(/[^A-Za-z0-9_]/g, '_')
            .toLowerCase()
            .slice(0, 63)
        const cols = columns.map(col => `"${col}"`).join(', ')
        try {
            await sequelize.query(`CREATE INDEX IF NOT EXISTS "${name}" ON ${table_name} (${cols})`)
            created.push(`${bare}(${columns.join(', ')})`)
        } catch (e) {
            console.error(`  індекс ${name} не створено: ${e.message}`)
        }
    }

    if (created.length) {
        console.log(`📇 Додано індекси на зовнішні ключі (${created.length}): ${created.join(', ')}`)
    }
    return created
}
