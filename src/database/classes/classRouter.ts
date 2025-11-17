import express from 'express';
import {
  criarTurma,
  listarTurmas,
  deletarTurma,
  buscarTurmaPorId
} from './classController';

const router = express.Router();

router.post('/', criarTurma);
router.get('/', listarTurmas);
router.get('/:id', buscarTurmaPorId);  // ANTES do DELETE
router.delete('/:id', deletarTurma);


export default router;
