// Desenvolvido por Felipe Miranda (Armazenar, Listar e Deletar Disciplina)
// Desenvolvido por Gabriel Coutinho (Armazenar, Listar e Deletar Disciplina, Componentes, Fórmulas e validações de vínculo)

import express from "express";
import {
  criarDisciplina,
  listarDisciplinas,
  deletarDisciplina,
  buscarDisciplinaPorId,
  listarFormulaEComponentes,
  salvarFormula,
  listarComponentes,
  criarComponente,
  deletarComponente
} from './disciplineController';

const router = express.Router();

// Cria uma disciplina
router.post('/', criarDisciplina);

// Lista disciplinas
router.get('/', listarDisciplinas);

// Busca disciplina por ID
router.get('/:id', buscarDisciplinaPorId);

// Deleta disciplina por ID
router.delete('/:id', deletarDisciplina);

// Fórmula: listar e salvar para uma disciplina
router.get('/:id/formula', listarFormulaEComponentes);
router.post('/:id/formula', salvarFormula);

// Componentes: listar, criar e deletar para uma disciplina
router.get('/:id/componentes', listarComponentes);
router.post('/:id/componentes', criarComponente);
router.delete('/:id/componentes/:id_comp', deletarComponente);

export default router;
