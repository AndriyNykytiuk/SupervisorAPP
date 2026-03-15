import sequelize from './backEnd/config/db.js';
import { TestItem, testList, ToolItem, toolList, Brigade } from './backEnd/models/index.js';

async function run() {
  const tItems2 = await TestItem.findAll({ where: { brigadeId: 2 } });
  console.log("TestItems in Brigade ID=2 (22 ДПРЧ):", tItems2.length);
  
  const toolItems2 = await ToolItem.findAll({ where: { brigadeId: 2 } });
  console.log("ToolItems in Brigade ID=2 (22 ДПРЧ):", toolItems2.length);

  const tItems1 = await TestItem.findAll({ where: { brigadeId: 1 } });
  console.log("TestItems in Brigade ID=1 (23 ДПРЧ):", tItems1.length);
  
  const toolItems1 = await ToolItem.findAll({ where: { brigadeId: 1 } });
  console.log("ToolItems in Brigade ID=1 (23 ДПРЧ):", toolItems1.length);

  console.log("Драбини in Brigade ID=2:", tItems2.filter(i => i.name.toLowerCase().includes('драбина')).map(i => i.toJSON()));

  process.exit();
}
run();
