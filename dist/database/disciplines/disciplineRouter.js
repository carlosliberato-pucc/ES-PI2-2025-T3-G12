"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const disciplineController_1 = require("./disciplineController");
const disciplineController_2 = require("./disciplineController");
const router = express_1.default.Router();
// ============================================
// ROTAS - ORDEM IMPORTANTE!
// ============================================
// 1. POST criar
router.post('/', disciplineController_1.criarDisciplina);
// 2. GET listar todas
router.get('/', disciplineController_1.listarDisciplinas);
// 3. Rotas específicas ANTES de /:id genérico
router.get('/:id/formula', disciplineController_2.listarFormulaEComponentes);
router.post('/:id/formula', disciplineController_2.salvarFormula);
router.get('/:id/componentes', disciplineController_2.listarComponentes);
router.post('/:id/componentes', disciplineController_2.criarComponente);
router.delete('/:id/componentes/:id_comp', disciplineController_2.deletarComponente);
// 4. GET uma disciplina específica (ADICIONE AQUI)
router.get('/:id', disciplineController_2.buscarDisciplinaPorId);
// 5. DELETE por último
router.delete('/:id', disciplineController_1.deletarDisciplina);
exports.default = router;
