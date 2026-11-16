/**
 * Recria o banco com os dados de demonstração.
 * Uso: npm run seed
 */
const fs = require('node:fs');
const config = require('../config');
const { createDatabase } = require('./database');

async function reset() {
  if (config.dbFile !== ':memory:' && fs.existsSync(config.dbFile)) {
    fs.rmSync(config.dbFile);
  }
  const db = await createDatabase(config.dbFile);
  console.log(
    `Banco recriado em ${config.dbFile}: ${db.all('users').length} usuários, ${db.all('posts').length} posts, ${db.all('comments').length} comentários.`,
  );
}

reset().catch((error) => {
  console.error(error);
  process.exit(1);
});
