"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Desenvolvido por Carlos Liberato
const express_1 = require("express");
const authController_1 = require("./authController");
const router = (0, express_1.Router)();
// Cadastro de usuário
router.post('/register', authController_1.register);
// Login do usuário
router.post('/login', authController_1.login);
// Logout
router.post('/logout', authController_1.logout);
// Verifica se sessão está ativa
router.get('/verificar-sessao', authController_1.verificarSessao);
// Envia e-mail para recuperação de senha
router.post('/forgot-password', authController_1.solicitarRecuperacaoSenha);
// Valida token do link enviado para redefinição
router.get('/validate-token', authController_1.validarToken);
// Redefinindo a senha
router.post('/reset-password', authController_1.redefinirSenha);
exports.default = router;
