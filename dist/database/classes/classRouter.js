"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const classController_1 = require("./classController");
const router = express_1.default.Router();
// ==================== ROTAS DE TURMAS ====================
// POST /api/turmas - Criar turma
// Body: { id_instituicao, id_curso, id_disciplina, nome }
router.post('/', classController_1.criarTurma);
// GET /api/turmas?id_instituicao=X&id_curso=Y&id_disciplina=Z - Listar turmas
router.get('/', classController_1.listarTurmas);
exports.default = router;
