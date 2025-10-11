"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Desenvolvido por Carlos Liberato
const express_1 = require("express");
// Importa as funções de autenticação (cadastro e login).
const authController_1 = require("./authController");
// Esta variável "router" é que agrupa todas as rotas deste módulo.
const router = (0, express_1.Router)();
// Quando o servidor recebe uma requisição HTTP do tipo POST para a URL '/register', 
// ele executa a função 'register' que está no authController.
router.post('/register', authController_1.register);
// Quando o servidor recebe uma requisição HTTP do tipo POST para a URL '/login', 
// ele executa a função 'login' que está no authController.
router.post('/login', authController_1.login);
exports.default = router;
