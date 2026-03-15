import sequelize from './backEnd/config/db.js';
import { TestItem, testList, ToolItem, toolList } from './backEnd/models/index.js';

async function run() {
  const tLists = await testList.findAll();
  console.log("Test Lists:", tLists.map(t => t.toJSON()));
  
  const tools = await toolList.findAll();
  console.log("Tool Lists:", tools.map(t => t.toJSON()));

  const items = await TestItem.findAll({ where: { name: 'Драбина' }});
  console.log("Ladders:", items.map(t => t.toJSON()));
  process.exit();
}
run().catch(console.error);
