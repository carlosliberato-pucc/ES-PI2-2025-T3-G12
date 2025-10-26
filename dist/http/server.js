"use strict";
// Desenvolvido por Carlos Liberato e Felipe Miran
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config(); // Carrega variáveis de ambiente (como a porta) do arquivo .env.
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path")); // Módulo nativo do Node.js para trabalhar com caminhos de arquivo.
const authRouter_1 = __importDefault(require("../database/auth/authRouter")); // Importa as rotas de login/cadastro.
const express_session_1 = __importDefault(require("express-session"));
const app = (0, express_1.default)(); // Inicializa o aplicativo Express.
// Configuração do express-session (ANTES de qualquer rota!)
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'abc1234segredo',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // true apenas se usar HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 30 // 30 min
    }
}));
//Middlewares Globais, Regras Aplicadas a Todas as Requisições
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true,
})); // Permite requisições de diferentes domínios (importante para o frontend/API).
app.use(body_parser_1.default.json()); //Processa o corpo da requisição e o converte para JSON.
//O '__dirname' retorna o caminho da pasta atual.
//Esta linha constrói o caminho absoluto para a pasta 'public', onde estão seus HTMLs.
const publicPath = path_1.default.resolve(__dirname, '../../public');
// Middleware para proteger rotas
const verificarAutenticacao = (req, res, next) => {
    if (req.session.userEmail) {
        next(); // Usuário autenticado, continua
    }
    else {
        // Redireciona para login se não estiver autenticado
        res.redirect('/');
    }
};
//Serve o código javascript compilado: Permite que o navegador acesse os scripts
//compilados (sign_in.js, sign_up.js) na URL /dist.
app.use('/dist', express_1.default.static(path_1.default.resolve(__dirname, '../../dist')));
// Quando um usuário acessa a URL base o servidor envia o arquivo 'sign_in.html'.
app.get('/', (req, res) => {
    res.sendFile('sign_in.html', { root: publicPath });
});
// Rotas PÚBLICAS (sem autenticação)
app.get('/', (req, res) => {
    console.log('🔍 Rota / acessada. SessionID:', req.session.userEmail); // Debug
    // Se já estiver logado, vai direto pro dashboard
    if (req.session && req.session.userEmail) {
        console.log('✅ Usuário logado, redirecionando para dashboard');
        return res.redirect('/dashboard.html');
    }
    console.log('❌ Usuário não logado, mostrando sign_in');
    res.sendFile('sign_in.html', { root: publicPath });
});
app.get('/sign_in.html', (req, res) => {
    if (req.session.userEmail) {
        return res.redirect('/dashboard.html');
    }
    res.sendFile('sign_in.html', { root: publicPath });
});
app.get('/sign_up.html', (req, res) => {
    if (req.session.userEmail) {
        return res.redirect('/dashboard.html');
    }
    res.sendFile('sign_up.html', { root: publicPath });
});
// Anexa todas as rotas importadas do 'authRouter' (register e login) 
// sob o prefixo '/auth' (ex: /auth/login, /auth/register).
app.use('/auth', authRouter_1.default);
app.get('/dashboard.html', verificarAutenticacao, (req, res) => {
    res.sendFile('dashboard.html', { root: publicPath });
});
// CSS e imagens públicas (não precisa autenticação)
app.use('/css', express_1.default.static(path_1.default.join(publicPath, 'css')));
app.use('/img', express_1.default.static(path_1.default.join(publicPath, 'img')));
const PORT = 3000; // Define a porta de escuta.
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`)); // Inicia o servidor.
