"use strict";
// Desenvolvido por Carlos Liberato (Rotas de Notas Finais)
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notaFinalController_1 = require("./notaFinalController");
const router = express_1.default.Router();
// Salva nota final para um aluno na turma
router.post('/', notaFinalController_1.salvarNotaFinal);
// Lista todas as notas finais de uma turma
router.get('/:turma', notaFinalController_1.buscarNotasFinais);
exports.default = router;
