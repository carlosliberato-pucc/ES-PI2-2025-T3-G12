"use strict";
// Desenvolvido por Felipe Miranda (Armazenar, Listar e Deletar Curso)
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const courseController_1 = require("./courseController");
const router = express_1.default.Router();
// Método para criar curso
router.post('/', courseController_1.criarCurso);
// Método para listar os cursos
router.get('/', courseController_1.listarCursos);
// Método para deletar os cursos
router.delete('/:id_curso', courseController_1.deletarCurso);
exports.default = router;
