import express from "express";

import {
  criarDisciplina,
  listarDisciplinas,
  deletarDisciplina
} from './disciplineController';

import {
  listarFormulaEComponentes,
  salvarFormula,
  listarComponentes,
  criarComponente,
  deletarComponente,
  buscarDisciplinaPorId
} from './disciplineController';

const router = express.Router();

// ============================================
// ROTAS - ORDEM IMPORTANTE!
// ============================================

// 1. POST criar
router.post('/', criarDisciplina);

// 2. GET listar todas
router.get('/', listarDisciplinas);

// 3. Rotas específicas ANTES de /:id genérico
router.get('/:id/formula', listarFormulaEComponentes);
router.post('/:id/formula', salvarFormula);
router.get('/:id/componentes', listarComponentes);
router.post('/:id/componentes', criarComponente);
router.delete('/:id/componentes/:id_comp', deletarComponente);

// 4. GET uma disciplina específica (ADICIONE AQUI)
router.get('/:id', buscarDisciplinaPorId);

// 5. DELETE por último
router.delete('/:id', deletarDisciplina);


export default router;
