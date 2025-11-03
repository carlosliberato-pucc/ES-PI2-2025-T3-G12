"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const courseController_1 = require("./courseController");
const router = express_1.default.Router();
// ==================== ROTAS DE CURSOS ====================
// POST /api/instituicoes/:id_instituicao/cursos - Criar curso em uma instituição
router.post('/:id_instituicao/cursos', courseController_1.criarCurso);
// GET /api/instituicoes/:id_instituicao/cursos - Listar cursos de uma instituição
router.get('/:id_instituicao/cursos', courseController_1.listarCursos);
// PUT /api/cursos/:id_curso - Atualizar curso
router.put('/cursos/:id_curso', courseController_1.atualizarCurso);
// DELETE /api/cursos/:id_curso - Deletar curso
router.delete('/cursos/:id_curso', courseController_1.deletarCurso);
exports.default = router;
