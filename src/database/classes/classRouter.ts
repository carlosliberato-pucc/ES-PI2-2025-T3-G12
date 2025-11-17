// Desenvolvido por Felipe Miranda (Armazenar, Listar e Deletar Turma)

import express from 'express';
import {
  criarTurma,
  listarTurmas,
  deletarTurma,
  buscarTurmaPorId
} from './classController';

const router = express.Router();

// Cria turma
router.post('/', criarTurma);

// Lista turmas por filtros de query
router.get('/', listarTurmas);

// Busca turma por ID
router.get('/:id', buscarTurmaPorId);

// Deleta turma por ID
router.delete('/:id', deletarTurma);

export default router;
