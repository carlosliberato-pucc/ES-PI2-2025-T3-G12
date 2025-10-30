"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const institutionController_1 = require("./institutionController");
const router = express_1.default.Router();
// ==================== ROTAS DE INSTITUIÇÕES ====================
// POST /api/instituicoes - Criar nova instituição
router.post('/', institutionController_1.criarInstituicao);
// GET /api/instituicoes - Listar todas as instituições do usuário
router.get('/', institutionController_1.listarInstituicoes);
// PATCH /api/instituicoes/:id/cor - Atualizar cor da instituição
router.patch('/:id/cor', institutionController_1.atualizarCorInstituicao);
// DELETE /api/instituicoes/:id - Deletar instituição
router.delete('/:id', institutionController_1.deletarInstituicao);
exports.default = router;
