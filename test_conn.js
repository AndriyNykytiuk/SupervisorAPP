import sequelize from './backEnd/config/db.js';
import { Brigade } from './backEnd/models/index.js';

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Connected');
    const b = await Brigade.findAll();
    console.log('Brigades count:', b.length);
    console.log(JSON.stringify(b, null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}
run();
