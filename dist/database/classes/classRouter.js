"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const classController_1 = require("./classController");
const router = express_1.default.Router();
// Cria turma
router.post('/', classController_1.criarTurma);
// Lista turmas por filtros de query
router.get('/', classController_1.listarTurmas);
// Busca turma por ID
router.get('/:id', classController_1.buscarTurmaPorId);
// Deleta turma por ID
router.delete('/:id', classController_1.deletarTurma);
exports.default = router;
