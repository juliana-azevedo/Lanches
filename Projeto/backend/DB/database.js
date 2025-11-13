import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool, Client } = pkg;

// nome do banco que queremos garantir
const targetDb = process.env.PGDATABASE;

// cria cliente temporário conectado ao banco padrão "postgres"
const adminClient = new Client({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  database: "postgres", // banco padrão do PostgreSQL
});

async function ensureDatabaseExists() {
  try {
    await adminClient.connect();

    const result = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [targetDb]
    );

    if (result.rowCount === 0) {
      console.log(`⚙️ Banco "${targetDb}" não existe. Criando...`);
      await adminClient.query(`CREATE DATABASE "${targetDb}";`);
      console.log(`✅ Banco "${targetDb}" criado com sucesso!`);
    } else {
      console.log(`✅ Banco "${targetDb}" já existe.`);
    }
  } catch (err) {
    console.error("❌ Erro ao verificar/criar banco:", err);
  } finally {
    await adminClient.end();
  }
}

// cria o pool real de conexão
const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  database: targetDb,
});

async function ensureTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categorias (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        descricao TEXT
      );
    `);

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_categoria_nome_lower
      ON categorias (LOWER(nome));
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS produtos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        preco DECIMAL(10, 2) NOT NULL,
        categoria_id INTEGER REFERENCES categorias(id) ON DELETE CASCADE ON UPDATE CASCADE,
        descricao TEXT
      );
    `);

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_produto_nome_lower
      ON produtos (LOWER(nome));
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id VARCHAR(100) PRIMARY KEY,
        type INT DEFAULT 0,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        passwordhash VARCHAR(100) NOT NULL,
        authprovider VARCHAR(50) NOT NULL,
        endereco VARCHAR(100),
        telefone VARCHAR(100),
        UNIQUE(email)
      );
    `);

    console.log("✅ Tabela 'categorias' verificada/criada com sucesso!");
  } catch (err) {
    console.error("❌ Erro ao criar tabela:", err);
  }
}

// executa a verificação antes de usar o pool
await ensureDatabaseExists();
await ensureTables();

pool.connect()
  .then(() => console.log(`🔗 Conectado ao banco "${targetDb}"`))
  .catch(err => console.error("❌ Erro ao conectar:", err));

export default pool;
