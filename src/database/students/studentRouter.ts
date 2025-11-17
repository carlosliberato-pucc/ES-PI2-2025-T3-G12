// Desenvolvido por Carlos Liberato (Criar, Listar, Editar e Deletar Alunos)

import express from 'express';
import { criarAluno, listarAlunos, editarAluno, deletarAluno } from './studentController';

const router = express.Router();

router.post('/:id/alunos', criarAluno);                 // criar
router.get('/:id/alunos', listarAlunos);                // listar
router.put('/:id/alunos/:matricula', editarAluno);      // editar
router.delete('/:id/alunos/:matricula', deletarAluno);  // excluir

export default router;
