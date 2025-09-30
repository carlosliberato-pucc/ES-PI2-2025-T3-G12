// Desenvolvido por Carlos Liberato

import * as dotenv from 'dotenv';
dotenv.config(); // Carrega variáveis de ambiente (como a porta) do arquivo .env.

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path'; // Módulo nativo do Node.js para trabalhar com caminhos de arquivo.
import authRoutes from '../database/auth/authRouter'; // Importa as rotas de login/cadastro.

const app = express(); // Inicializa o aplicativo Express.

//Middlewares Globais, Regras Aplicadas a Todas as Requisições
app.use(cors()); // Permite requisições de diferentes domínios (importante para o frontend/API).
app.use(bodyParser.json()); //Processa o corpo da requisição e o converte para JSON.


//O '__dirname' retorna o caminho da pasta atual.
//Esta linha constrói o caminho absoluto para a pasta 'public', onde estão seus HTMLs.
const publicPath = path.resolve(__dirname, '../../public');

//Serve arquivos estáticos: Permite que arquivos dentro da pasta 'public' 
//(como imagens, CSS) sejam acessados diretamente pela URL.
app.use(express.static(publicPath)); 

//Serve o código javascript compilado: Permite que o navegador acesse os scripts
//compilados (sign_in.js, sign_up.js) na URL /dist.
app.use('/dist', express.static(path.resolve(__dirname, '../../dist')));

// Quando um usuário acessa a URL base o servidor envia o arquivo 'sign_in.html'.
app.get('/', (req, res) => {
    res.sendFile('sign_in.html', { root: publicPath });
});

// Anexa todas as rotas importadas do 'authRouter' (register e login) 
// sob o prefixo '/auth' (ex: /auth/login, /auth/register).
app.use('/auth', authRoutes);

const PORT = 3000; // Define a porta de escuta.
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`)); // Inicia o servidor.