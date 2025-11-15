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
    deletarComponente
} from './disciplineController';

const router = express.Router();

router.post('/', criarDisciplina);

router.get('/', listarDisciplinas);

router.delete('/:id', deletarDisciplina);

// Rotas para fórmula e componentes (por disciplina)
router.get('/:id/formula', listarFormulaEComponentes);
router.post('/:id/formula', salvarFormula);

router.get('/:id/componentes', listarComponentes);
router.post('/:id/componentes', criarComponente);
router.delete('/:id/componentes/:id_comp', deletarComponente);

export default router;