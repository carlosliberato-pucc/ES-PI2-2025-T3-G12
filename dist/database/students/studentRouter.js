"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const studentController_1 = require("./studentController");
const router = express_1.default.Router();
// Rota para criar aluno na turma
router.post('/:id/alunos', studentController_1.criarAluno);
// Rota para listar alunos da turma
router.get('/:id/alunos', studentController_1.listarAlunos);
exports.default = router;
