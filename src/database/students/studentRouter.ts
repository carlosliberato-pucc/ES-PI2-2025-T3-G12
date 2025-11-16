import express from "express";
import { criarAluno, listarAlunos } from './studentController';

const router = express.Router();

// Rota para criar aluno na turma
router.post('/:id/alunos', criarAluno);

// Rota para listar alunos da turma
router.get('/:id/alunos', listarAlunos);

export default router;
