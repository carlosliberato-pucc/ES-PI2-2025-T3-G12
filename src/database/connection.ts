// Desenvolvido por Carlos Liberato
import mysql from 'mysql2';
import * as dotenv from 'dotenv';

// Carrega variáveis do .env
dotenv.config();

// Configurações do banco
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'notadez',
};

// Cria pool de conexões para escalabilidade
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  namedPlaceholders: false
});

// Log de inicialização em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  console.log('MySQL pool criado (connectionLimit:', (process.env.DB_CONNECTION_LIMIT || 10) + ')');
}

export default pool;
