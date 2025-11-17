"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const disciplineController_1 = require("./disciplineController");
const router = express_1.default.Router();
// Cria uma disciplina
router.post('/', disciplineController_1.criarDisciplina);
// Lista disciplinas
router.get('/', disciplineController_1.listarDisciplinas);
// Busca disciplina por ID
router.get('/:id', disciplineController_1.buscarDisciplinaPorId);
// Deleta disciplina por ID
router.delete('/:id', disciplineController_1.deletarDisciplina);
// Fórmula: listar e salvar para uma disciplina
router.get('/:id/formula', disciplineController_1.listarFormulaEComponentes);
router.post('/:id/formula', disciplineController_1.salvarFormula);
// Componentes: listar, criar e deletar para uma disciplina
router.get('/:id/componentes', disciplineController_1.listarComponentes);
router.post('/:id/componentes', disciplineController_1.criarComponente);
router.delete('/:id/componentes/:id_comp', disciplineController_1.deletarComponente);
exports.default = router;
