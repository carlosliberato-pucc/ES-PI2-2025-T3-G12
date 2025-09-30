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

//Cria um objeto de conexão usando as credenciais definidas acima.
const connection = mysql.createConnection(dbConfig);


connection.connect((err) => {
    //Tratamento de Erro: Se houver um erro (ex: credenciais incorretas, MySQL offline).
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.stack);
        //Interrompe a execução, pois o aplicativo não pode funcionar sem o banco.
        return; 
    }
    // Se a conexão for estabelecida.
    console.log('Conectado ao banco de dados MySQL com sucesso!');
});

export default connection;