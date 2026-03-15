import sequelize from './backEnd/config/db.js';
import * as Models from './backEnd/models/index.js';

async function run() {
    console.log('Starting bug investigation script...');
    try {
        console.log('Authenticating...');
        await sequelize.authenticate();
        console.log('Connected to DB');

        const { TestItem, testList, ToolItem, toolList, Brigade } = Models;

        console.log('Fetching Brigades...');
        const brigades = await Brigade.findAll();
        console.log(`Found ${brigades.length} brigades.`);
        brigades.forEach(b => console.log(` - ID: ${b.id}, Name: ${b.name}`));

        console.log('Fetching TestItems for Brigade 2 (Target)...');
        const items22 = await TestItem.findAll({ where: { brigadeId: 2 }, include: [testList] });
        console.log(`Found ${items22.length} items in Brigade 2.`);
        items22.forEach(i => console.log(`    - [${i.id}] ${i.name} (List: ${i.testList?.name || 'NULL'})`));

        console.log('Fetching TestItems for Brigade 1 (Source)...');
        const items23 = await TestItem.findAll({ where: { brigadeId: 1 }, include: [testList] });
        console.log(`Found ${items23.length} items in Brigade 1.`);
        items23.forEach(i => console.log(`    - [${i.id}] ${i.name} (List: ${i.testList?.name || 'NULL'})`));

        console.log('Searching for "Leader" or "Драбина" in all test items...');
        const allLadders = await TestItem.findAll({
            where: {
                name: { [sequelize.Sequelize.Op.like]: '%драбина%' }
            },
            include: [Brigade]
        });
        console.log(`Found ${allLadders.length} ladders across all brigades.`);
        allLadders.forEach(l => console.log(`    - [${l.id}] ${l.name} in Brigade ${l.Brigade?.name || l.brigadeId}`));

    } catch (err) {
        console.error('CRITICAL ERROR:', err);
    } finally {
        console.log('Script finished.');
        process.exit();
    }
}
run();
