import sequelize from './backEnd/config/db.js';
import { User, Brigade } from './backEnd/models/index.js';

async function run() {
  try {
    await sequelize.authenticate();
    const users = await User.findAll({ include: [Brigade] });
    console.log('Total Users:', users.length);
    users.forEach(u => console.log(`User: ${u.name}, Role: ${u.role}, Brigade: ${u.Brigade?.name || 'NONE'} (ID: ${u.brigadeId})`));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
run();
