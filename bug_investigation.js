import sequelize from './backEnd/config/db.js';
import { TestItem, testList, ToolItem, toolList, Brigade } from './backEnd/models/index.js';

async function run() {
  try {
    await sequelize.authenticate();
    
    // Check all test items for both brigades
    const items22 = await TestItem.findAll({ where: { brigadeId: 2 }, include: [testList] });
    const items23 = await TestItem.findAll({ where: { brigadeId: 1 }, include: [testList] });

    console.log("--- Brigade 22 (Target) ---");
    items22.forEach(i => console.log(JSON.stringify({id: i.id, name: i.name, list: i.testList?.name || 'NULL', listId: i.testListId})));

    console.log("--- Brigade 23 (Source) ---");
    items23.forEach(i => console.log(JSON.stringify({id: i.id, name: i.name, list: i.testList?.name || 'NULL', listId: i.testListId})));

    // Check for any items that might have been lost (e.g. no brigadeId)
    const lostItems = await TestItem.findAll({ where: { brigadeId: null } });
    console.log("--- Lost Items (No Brigade) ---");
    lostItems.forEach(i => console.log(JSON.stringify({id: i.id, name: i.name})));

    // Check ToolItems too
    const tools22 = await ToolItem.findAll({ where: { brigadeId: 2 }, include: [toolList] });
    console.log("--- ToolItems Brigade 22 ---");
    tools22.forEach(i => console.log(JSON.stringify({id: i.id, name: i.name, list: i.toolList?.name || 'NULL'})));

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
run();
