"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificarSessao = exports.logout = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
// Importando Conexão com o banco de dados
const index_1 = require("../index");
// Função de cadastro
const register = async (req, res) => {
    //Extraindo os dados dos inputs
    const { nome, email, telefone, senha } = req.body;
    //Validação dos campos. Verifica se todos os campos foram preenchidos.
    if (!nome || !email || !telefone || !senha) {
        return res.status(400).send('Preencha todos os campos');
    }
    try {
        //Criação do hash (criptografia) com o bcrypt.
        const hash = await bcrypt_1.default.hash(senha, 10);
        //Comandos SQL para inserir usuário
        index_1.db.query('INSERT INTO usuario (nome, email, telefone, senha) VALUES (?, ?, ?, ?)', // ? para segurança
        [nome, email, telefone, hash], (err) => {
            if (err) {
                //Tratamento de erro para chave duplicada Erro_Duplicada_Entrada
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).send('E-mail já cadastrado');
                }
                console.error('Erro ao cadastrar usuário: ', err);
                return res.status(500).send('Erro ao cadastrar usuário');
            }
            // Cria sessão automaticamente após cadastro
            req.session.userEmail = email;
            req.session.userName = nome;
            // No final da função login, antes do res.send:
            console.log('✅ Sessão criada:', req.session);
            //Se não tiver erros, Cadastro realizado
            res.send('Cadastro realizado com sucesso!');
        });
    }
    catch (error) {
        //Tratamento de erros do servidor. 
        console.error('Erro no servidor durante o cadastro: ', error);
        res.status(500).send('Erro no servidor');
    }
};
exports.register = register;
//Função de login
const login = (req, res) => {
    //Extraindo dados dos campos.
    const { email, senha } = req.body;
    //Verifica se os campos foram preenchidos.
    if (!email || !senha) {
        return res.status(400).send('Preencha todos os campos');
    }
    //Comandos do SQL para selecionar usuário
    index_1.db.query('SELECT * FROM usuario WHERE email = ?', [email], async (err, results) => {
        if (err) {
            //Valida dados de email
            //Se erro no servidor, retorna como erro do servidor.
            console.error('Erro no servidor durante o login: ', err);
            return res.status(500).send('Erro no servidor');
        }
        if (results.length === 0) {
            //Valida dados de email
            //Se os dados não foram encontrados, retorna uma mensagem.
            return res.status(401).send('E-mail ou senha incorretos.');
        }
        const user = results[0];
        //Compara a senha fornecida com o hash armazenado.
        const match = await bcrypt_1.default.compare(senha, user.senha);
        //Se a senha estiver incorreta, retorna uma mensagem.
        if (!match) {
            return res.status(401).send('E-mail ou senha incorretos.');
        }
        // Cria a sessão do usuário
        req.session.userEmail = user.email;
        req.session.userName = user.nome;
        // No final da função login, antes do res.send:
        console.log('✅ Sessão criada:', req.session);
        res.send('Login realizado');
    });
};
exports.login = login;
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erro ao fazer logout:', err);
            return res.status(500).send('Erro ao fazer logout');
        }
        res.clearCookie('connect.sid'); // Remove o cookie de sessão
        res.send('Logout realizado com sucesso');
    });
};
exports.logout = logout;
// Função para verificar se usuário está logado
const verificarSessao = (req, res) => {
    if (req.session.userEmail) {
        res.json({
            logado: true,
            usuario: {
                email: req.session.userEmail,
                nome: req.session.userName
            }
        });
    }
    else {
        res.json({ logado: false });
    }
};
exports.verificarSessao = verificarSessao;
