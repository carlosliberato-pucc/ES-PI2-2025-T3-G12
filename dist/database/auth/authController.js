"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
// ATENÇÃO: Ajuste o caminho para o seu arquivo de conexão com o DB
const index_1 = require("../index");
// --- FUNÇÃO DE CADASTRO (REGISTER) ---
const register = async (req, res) => {
    const { nome, email, telefone, senha } = req.body;
    if (!nome || !email || !telefone || !senha) {
        return res.status(400).send('Preencha todos os campos');
    }
    try {
        const hash = await bcrypt_1.default.hash(senha, 10);
        index_1.db.query('INSERT INTO usuario (nome, email, telefone, senha) VALUES (?, ?, ?, ?)', [nome, email, telefone, hash], (err) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).send('E-mail já cadastrado');
                }
                console.error('Erro ao cadastrar usuário: ', err);
                return res.status(500).send('Erro ao cadastrar usuário');
            }
            res.send('Cadastro realizado com sucesso!');
        });
    }
    catch (error) {
        console.error('Erro no servidor durante o cadastro: ', error);
        res.status(500).send('Erro no servidor');
    }
};
exports.register = register;
// --- FUNÇÃO DE LOGIN (CORRIGIDA) ---
const login = (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).send('Preencha todos os campos');
    }
    // A função de callback é marcada como 'async' para permitir o 'await' do bcrypt.compare
    index_1.db.query('SELECT * FROM usuario WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error('Erro no servidor durante o login: ', err);
            return res.status(500).send('Erro no servidor');
        }
        // 1. Verifica se o usuário existe (Retorna 401 por segurança)
        if (results.length === 0) {
            return res.status(401).send('E-mail ou senha incorretos.');
        }
        const user = results[0];
        // 2. Compara a senha (CORREÇÃO DE SINTAXE)
        const match = await bcrypt_1.default.compare(senha, user.senha);
        if (!match) {
            // Retorna a mesma mensagem genérica por segurança
            return res.status(401).send('E-mail ou senha incorretos.');
        }
        res.send('Login realizado');
    });
};
exports.login = login;
