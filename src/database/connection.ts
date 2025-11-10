// Desenvolvido por Carlos Liberato
import mysql from 'mysql2';

import * as dotenv from 'dotenv';
// Garante que o arquivo .env (onde estão HOST, USER e PASSWORD) seja lido e
// suas variáveis injetadas em process.env antes de qualquer conexão.
dotenv.config();

const dbConfig = {
    // Tenta usar a variável DB_HOST do .env; se não existir, usa 'localhost'.
    host: process.env.DB_HOST || 'localhost',
    // Tenta usar a variável DB_USER do .env; se não existir, usa 'root'.
    user: process.env.DB_USER || 'root',
    // Tenta usar a variável DB_PASSWORD do .env; se não existir, usa uma string vazia.
    password: process.env.DB_PASSWORD || '',
    // Tenta usar a variável DB_NAME do .env; se não existir, usa 'notadez'.
    database: process.env.DB_NAME || 'notadez',
};

// Cria um pool de conexões (mais resiliente que single connection)
const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: 0,
    namedPlaceholders: false
});

// Log simples para desenvolvimento
if (process.env.NODE_ENV !== 'production') {
    console.log('MySQL pool criado (connectionLimit:', (process.env.DB_CONNECTION_LIMIT || 10) + ')');
}

export default pool;