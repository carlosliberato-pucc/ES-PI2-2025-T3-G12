"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// ATENÇÃO: Verifique se este caminho está correto para o seu Controller
const authController_1 = require("./authController");
const router = (0, express_1.Router)();
router.post('/register', authController_1.register);
router.post('/login', authController_1.login);
exports.default = router;
