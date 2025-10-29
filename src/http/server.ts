// Desenvolvido por Carlos Liberato e Felipe Miranda

import * as dotenv from 'dotenv';
dotenv.config(); // Carrega variáveis de ambiente (como a porta) do arquivo .env.

import express, {Request, Response, NextFunction} from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path'; // Módulo nativo do Node.js para trabalhar com caminhos de arquivo.
import authRoutes from '../database/auth/authRouter'; // Importa as rotas de login/cadastro.
import session from 'express-session';
import institutionRoutes from '../database/institutions/institutionRouter';

const app = express(); // Inicializa o aplicativo Express.

// Configuração do express-session
app.use(session({
    secret: process.env.SESSION_SECRET || 'abc1234segredo',
    resave: false, // só salva o cookie quando modificado
    saveUninitialized: false, // evita a criação de sessões vazias
    cookie: {
        secure: false, // além de https pode usar http
        httpOnly: true, // faz o cookie inacessivel via javascript
        maxAge: 1000 * 60 * 30 // 30 min
    }
}));

//Middlewares Globais, Regras Aplicadas a Todas as Requisições
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true, // permite a requisição de cookies em diferentes rotas
})); // Permite requisições de diferentes domínios (importante para o frontend/API).

app.use(bodyParser.json()); //Processa o corpo da requisição e o converte para JSON.

//O '__dirname' retorna o caminho da pasta atual.
//Esta linha constrói o caminho absoluto para a pasta 'public', onde estão seus HTMLs.
const publicPath = path.resolve(__dirname, '../../public');

// Middleware para proteger rotas
const verificarAutenticacao = (req: Request, res: Response, next: NextFunction) => {
    if (req.session.userEmail) {
        next(); // Usuário autenticado, continua
    } else {
        // Redireciona para login se não estiver autenticado
        res.redirect('/');
    }
};

//Serve o código javascript compilado: Permite que o navegador acesse os scripts
//compilados (sign_in.js, sign_up.js) na URL /dist.
app.use('/dist', express.static(path.resolve(__dirname, '../../dist')));

// Quando um usuário acessa a URL base o servidor envia o arquivo 'sign_in.html'.
app.get('/', (req, res) => {
    res.sendFile('sign_in.html', { root: publicPath });
});


// Rotas PÚBLICAS (sem autenticação)
app.get('/', (req, res) => {
    // Se já estiver logado, vai direto pro dashboard
    if (req.session && req.session.userEmail) {
        return res.redirect('/dashboard');
    }
    res.sendFile('sign_in.html', { root: publicPath });
});

app.get('/recover_password', (req, res) => {
    res.sendFile('recover_password.html', { root: publicPath });
});

app.get('/input_new_password', (req, res) => {
    res.sendFile('input_new_password.html', { root: publicPath });
});

app.get('/instituicoes', (req, res) => {
    res.sendFile('instituicoes.html', { root: publicPath });
});

app.get('/sign_in', (req, res) => {
    if (req.session.userEmail) {
        return res.redirect('/dashboard');
    }
    res.sendFile('sign_in.html', { root: publicPath });
});

app.get('/sign_up', (req, res) => {
    if (req.session.userEmail) {
        return res.redirect('/dashboard');
    }
    res.sendFile('sign_up.html', { root: publicPath });
});

// Anexa todas as rotas importadas do 'authRouter' (register e login) 
// sob o prefixo '/auth' (ex: /auth/login, /auth/register).
app.use('/auth', authRoutes);

// rotas protegidas
app.use('/api/instituicoes', verificarAutenticacao, institutionRoutes);
app.get('/dashboard', verificarAutenticacao, (req, res) => {
    res.sendFile('dashboard.html', { root: publicPath });
});

// CSS e imagens públicas (não precisa autenticação)
app.use('/css', express.static(path.join(publicPath, 'css')));
app.use('/img', express.static(path.join(publicPath, 'img')));

const PORT = 3000; // Define a porta de escuta.
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`)); // Inicia o servidor.