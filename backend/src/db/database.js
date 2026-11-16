const fs = require('node:fs');
const path = require('node:path');
const { seed } = require('./seed');

const EMPTY_STATE = () => ({ users: [], posts: [], comments: [] });

/**
 * Banco de dados simples em arquivo JSON.
 *
 * Os dados ficam em memória e cada escrita é persistida de forma atômica
 * (grava em arquivo temporário e renomeia). Com DB_FILE=":memory:" nada é salvo
 * em disco, o que é usado pelos testes automatizados.
 */
class Database {
  constructor(filePath) {
    this.filePath = filePath;
    this.inMemory = filePath === ':memory:';
    this.data = EMPTY_STATE();
  }

  load() {
    if (this.inMemory || !fs.existsSync(this.filePath)) return false;
    const content = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
    this.data = { ...EMPTY_STATE(), ...content };
    return true;
  }

  save() {
    if (this.inMemory) return;
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    const temporary = `${this.filePath}.tmp`;
    fs.writeFileSync(temporary, JSON.stringify(this.data, null, 2));
    fs.renameSync(temporary, this.filePath);
  }

  all(collection) {
    return this.data[collection];
  }

  findById(collection, id) {
    return this.data[collection].find((item) => item.id === id) || null;
  }

  findOne(collection, predicate) {
    return this.data[collection].find(predicate) || null;
  }

  insert(collection, document) {
    this.data[collection].push(document);
    this.save();
    return document;
  }

  update(collection, id, changes) {
    const item = this.findById(collection, id);
    if (!item) return null;
    Object.assign(item, changes, { updatedAt: new Date().toISOString() });
    this.save();
    return item;
  }

  remove(collection, id) {
    const index = this.data[collection].findIndex((item) => item.id === id);
    if (index === -1) return false;
    this.data[collection].splice(index, 1);
    this.save();
    return true;
  }

  removeWhere(collection, predicate) {
    const before = this.data[collection].length;
    this.data[collection] = this.data[collection].filter((item) => !predicate(item));
    if (this.data[collection].length !== before) this.save();
    return before - this.data[collection].length;
  }
}

/** Cria o banco, carregando o arquivo existente ou populando com dados iniciais. */
async function createDatabase(filePath) {
  const db = new Database(filePath);
  const loaded = db.load();
  if (!loaded || db.all('users').length === 0) {
    db.data = await seed();
    db.save();
  }
  return db;
}

module.exports = { Database, createDatabase };
