// Desenvolvido por Felipe Miranda (Armazenar, Listar e Deletar Disciplina)
// Desenvolvido por Gabriel Coutinho (Armazenar, Listar e Deletar Disciplina, Componentes, Fórmulas e validações de vínculo)

import express from "express";

import {
    criarDisciplina,
    listarDisciplinas,
    deletarDisciplina,
    buscarDisciplinaPorId
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

router.get('/:id', buscarDisciplinaPorId);

router.delete('/:id', deletarDisciplina);

// Rotas para fÃ³rmula e componentes (por disciplina)
router.get('/:id/formula', listarFormulaEComponentes);
router.post('/:id/formula', salvarFormula);

router.get('/:id/componentes', listarComponentes);
router.post('/:id/componentes', criarComponente);
router.delete('/:id/componentes/:id_comp', deletarComponente);

export default router;