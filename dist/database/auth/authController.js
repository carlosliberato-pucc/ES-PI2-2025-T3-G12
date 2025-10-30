"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redefinirSenha = exports.validarToken = exports.solicitarRecuperacaoSenha = exports.verificarSessao = exports.logout = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
// Importando Conexão com o banco de dados
const index_1 = require("../index");
const nodemailer_1 = __importDefault(require("nodemailer"));
const crypto_1 = __importDefault(require("crypto"));
// Configurar nodemailer
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail', // ou outro serviço
    auth: {
        user: process.env.EMAIL_USER, // seu-email@gmail.com
        pass: process.env.EMAIL_PASS // senha de app do Gmail
    }
});
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***existe***' : '❌ VAZIO');
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
            console.log('Sessão criada:', req.session);
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
        console.log('Sessão criada:', req.session);
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
// Parte da recuperação da senha
const solicitarRecuperacaoSenha = async (req, res) => {
    try {
        const { email } = req.body;
        // Validar entrada
        if (!email || !email.includes('@')) {
            return res.status(400).json({
                success: false,
                message: 'Email inválido'
            });
        }
        // Verificar se usuário existe
        index_1.db.query('SELECT email FROM usuario WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error('Erro ao buscar usuário:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao processar solicitação'
                });
            }
            // IMPORTANTE: Sempre retornar sucesso (segurança)
            // Não revelar se o email existe ou não
            if (!Array.isArray(results) || results.length === 0) {
                console.log(`Tentativa de recuperação para email não cadastrado: ${email}`);
                return res.json({
                    success: true,
                    message: 'Se o email existir, você receberá um link de recuperação.'
                });
            }
            try {
                // Gerar token seguro (32 bytes = 64 caracteres hexadecimais)
                const token = crypto_1.default.randomBytes(32).toString('hex');
                // Token expira em 1 hora
                const expiresAt = new Date();
                expiresAt.setHours(expiresAt.getHours() + 1);
                // Invalidar tokens antigos do mesmo usuário
                index_1.db.query('UPDATE password_reset_tokens SET used = TRUE WHERE user_email = ? AND used = FALSE', [email], (updateErr) => {
                    if (updateErr) {
                        console.error('Erro ao invalidar tokens antigos:', updateErr);
                    }
                });
                // Salvar novo token
                index_1.db.query('INSERT INTO password_reset_tokens (user_email, token, expires_at, used) VALUES (?, ?, ?, FALSE)', [email, token, expiresAt], async (insertErr) => {
                    if (insertErr) {
                        console.error('Erro ao salvar token:', insertErr);
                        return res.status(500).json({
                            success: false,
                            message: 'Erro ao processar solicitação'
                        });
                    }
                    // Criar link de recuperação
                    const resetLink = `http://localhost:3000/input_new_password?token=${token}`;
                    // Enviar email
                    const mailOptions = {
                        from: process.env.EMAIL_USER,
                        to: email,
                        subject: 'NotaDez - Recuperação de Senha',
                        html: `
                                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                                        <div style="text-align: center; margin-bottom: 30px; background: #0a3db7; border-bottom-left-radius: 80px; border-bottom-right-radius: 80px; padding-top: 20px; padding-bottom: 10px;">
                                            <h1 style="color: #ffc30f;">NotaDez</h1>
                                        </div>
                                        
                                        <h2 style="color: #333;">Recuperação de Senha</h2>
                                        <p>Olá,</p>
                                        <p>Você solicitou a recuperação de senha da sua conta NotaDez. Clique no botão abaixo para redefinir:</p>
                                        
                                        <div style="text-align: center; margin: 30px 0;">
                                            <a href="${resetLink}" 
                                               style="display: inline-block; padding: 15px 30px; background-color: #ffc30f; 
                                                      color: #0a3db7; text-decoration: none; border-radius: 5px; font-weight: bold;">
                                                Redefinir Senha
                                            </a>
                                        </div>
                                        
                                        <p style="color: #666; font-size: 14px;">
                                            Este link expira em 1 hora.
                                        </p>
                                        
                                        <p style="color: #666; font-size: 14px;">
                                            Se você não solicitou esta recuperação, ignore este email. Sua senha permanecerá segura.
                                        </p>
                                        
                                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                                        
                                        <p style="color: #999; font-size: 12px;">
                                            Caso o botão não funcione, copie e cole este link no navegador:<br>
                                            <span style="word-break: break-all;">${resetLink}</span>
                                        </p>
                                    </div>
                                `
                    };
                    try {
                        await transporter.sendMail(mailOptions);
                        console.log(`Email de recuperação enviado para: ${email}`);
                        res.json({
                            success: true,
                            message: 'Se o email existir, você receberá um link de recuperação.'
                        });
                    }
                    catch (mailError) {
                        console.error('Erro ao enviar email:', mailError);
                        res.status(500).json({
                            success: false,
                            message: 'Erro ao enviar email de recuperação'
                        });
                    }
                });
            }
            catch (error) {
                console.error('Erro ao processar recuperação:', error);
                res.status(500).json({
                    success: false,
                    message: 'Erro ao processar solicitação'
                });
            }
        });
    }
    catch (error) {
        console.error('Erro ao solicitar recuperação:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao processar solicitação'
        });
    }
};
exports.solicitarRecuperacaoSenha = solicitarRecuperacaoSenha;
// ==================== VALIDAR TOKEN ====================
const validarToken = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token || typeof token !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Token inválido'
            });
        }
        // Buscar token
        index_1.db.query('SELECT user_email, expires_at, used FROM password_reset_tokens WHERE token = ?', [token], (err, results) => {
            if (err) {
                console.error('Erro ao validar token:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao validar token'
                });
            }
            if (!Array.isArray(results) || results.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Token não encontrado'
                });
            }
            const resetToken = results[0];
            // Verificar se já foi usado
            if (resetToken.used) {
                return res.status(400).json({
                    success: false,
                    message: 'Token já foi utilizado'
                });
            }
            // Verificar se expirou
            if (new Date() > new Date(resetToken.expires_at)) {
                return res.status(400).json({
                    success: false,
                    message: 'Token expirado. Solicite uma nova recuperação.'
                });
            }
            // Token válido
            res.json({
                success: true,
                email: resetToken.user_email
            });
        });
    }
    catch (error) {
        console.error('Erro ao validar token:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao validar token'
        });
    }
};
exports.validarToken = validarToken;
// ==================== REDEFINIR SENHA ====================
const redefinirSenha = async (req, res) => {
    try {
        const { token, novaSenha } = req.body;
        // Validar entrada
        if (!token || !novaSenha) {
            return res.status(400).json({
                success: false,
                message: 'Dados incompletos'
            });
        }
        if (novaSenha.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Senha deve ter no mínimo 8 caracteres'
            });
        }
        // Buscar token
        index_1.db.query('SELECT user_email, expires_at, used FROM password_reset_tokens WHERE token = ?', [token], async (err, results) => {
            if (err) {
                console.error('Erro ao buscar token:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao processar solicitação'
                });
            }
            if (!Array.isArray(results) || results.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Token inválido'
                });
            }
            const resetToken = results[0];
            // Verificar se já foi usado ou expirou
            if (resetToken.used || new Date() > new Date(resetToken.expires_at)) {
                return res.status(400).json({
                    success: false,
                    message: 'Token inválido ou expirado'
                });
            }
            try {
                // Hash da nova senha
                const senhaHash = await bcrypt_1.default.hash(novaSenha, 10);
                // Atualizar senha do usuário
                index_1.db.query('UPDATE usuario SET senha = ? WHERE email = ?', [senhaHash, resetToken.user_email], (updateErr) => {
                    if (updateErr) {
                        console.error('Erro ao atualizar senha:', updateErr);
                        return res.status(500).json({
                            success: false,
                            message: 'Erro ao redefinir senha'
                        });
                    }
                    // Marcar token como usado
                    index_1.db.query('UPDATE password_reset_tokens SET used = TRUE WHERE token = ?', [token], (markErr) => {
                        if (markErr) {
                            console.error('Erro ao marcar token como usado:', markErr);
                        }
                        console.log(`Senha redefinida para: ${resetToken.user_email}`);
                        res.json({
                            success: true,
                            message: 'Senha redefinida com sucesso!'
                        });
                    });
                });
            }
            catch (hashError) {
                console.error('Erro ao fazer hash da senha:', hashError);
                res.status(500).json({
                    success: false,
                    message: 'Erro ao redefinir senha'
                });
            }
        });
    }
    catch (error) {
        console.error('Erro ao redefinir senha:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao redefinir senha'
        });
    }
};
exports.redefinirSenha = redefinirSenha;
