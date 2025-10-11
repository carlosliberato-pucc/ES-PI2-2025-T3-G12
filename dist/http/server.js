"use strict";
// Desenvolvido por Carlos Liberato
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
const app = (0, express_1.default)(); // Inicializa o aplicativo Express.
//Middlewares Globais, Regras Aplicadas a Todas as Requisições
app.use((0, cors_1.default)()); // Permite requisições de diferentes domínios (importante para o frontend/API).
app.use(body_parser_1.default.json()); //Processa o corpo da requisição e o converte para JSON.
//O '__dirname' retorna o caminho da pasta atual.
//Esta linha constrói o caminho absoluto para a pasta 'public', onde estão seus HTMLs.
const publicPath = path_1.default.resolve(__dirname, '../../public');
//Serve arquivos estáticos: Permite que arquivos dentro da pasta 'public' 
//(como imagens, CSS) sejam acessados diretamente pela URL.
app.use(express_1.default.static(publicPath));
//Serve o código javascript compilado: Permite que o navegador acesse os scripts
//compilados (sign_in.js, sign_up.js) na URL /dist.
app.use('/dist', express_1.default.static(path_1.default.resolve(__dirname, '../../dist')));
// Quando um usuário acessa a URL base o servidor envia o arquivo 'sign_in.html'.
app.get('/', (req, res) => {
    res.sendFile('sign_in.html', { root: publicPath });
});
// Anexa todas as rotas importadas do 'authRouter' (register e login) 
// sob o prefixo '/auth' (ex: /auth/login, /auth/register).
app.use('/auth', authRouter_1.default);
const PORT = 3000; // Define a porta de escuta.
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`)); // Inicia o servidor.
