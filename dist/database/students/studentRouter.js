"use strict";
// Desenvolvido por Carlos Liberato (Criar, Listar, Editar e Deletar Alunos)
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const studentController_1 = require("./studentController");
const router = express_1.default.Router();
router.post('/:id/alunos', studentController_1.criarAluno); // criar
router.get('/:id/alunos', studentController_1.listarAlunos); // listar
router.put('/:id/alunos/:matricula', studentController_1.editarAluno); // editar
router.delete('/:id/alunos/:matricula', studentController_1.deletarAluno); // excluir
exports.default = router;
