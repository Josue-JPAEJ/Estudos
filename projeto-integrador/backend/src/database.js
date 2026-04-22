const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const DB_FILE = process.env.DB_FILE || path.join(__dirname, '..', 'data.sqlite');

let dbInstance;

async function getDb() {
  if (!dbInstance) {
    dbInstance = await open({
      filename: DB_FILE,
      driver: sqlite3.Database,
    });

    await dbInstance.exec('PRAGMA foreign_keys = ON;');
  }

  return dbInstance;
}

async function initDatabase() {
  const db = await getDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS fornecedores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome_empresa TEXT NOT NULL,
      cnpj TEXT NOT NULL UNIQUE,
      endereco TEXT NOT NULL,
      telefone TEXT NOT NULL,
      email TEXT NOT NULL,
      contato_principal TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      codigo_barras TEXT NOT NULL UNIQUE,
      descricao TEXT NOT NULL,
      quantidade_estoque INTEGER NOT NULL,
      categoria TEXT NOT NULL,
      data_validade TEXT,
      imagem_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS produto_fornecedor (
      produto_id INTEGER NOT NULL,
      fornecedor_id INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (produto_id, fornecedor_id),
      FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
      FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id) ON DELETE CASCADE
    );
  `);
}

module.exports = {
  getDb,
  initDatabase,
};
