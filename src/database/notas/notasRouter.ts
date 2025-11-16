import express from 'express';
import { salvarNota, listarNotasTurma } from './notasController';

const router = express.Router();

router.post('/', salvarNota);                          // POST /api/notas
router.get('/turma/:idTurma', listarNotasTurma);       // GET /api/notas/turma/:idTurma

export default router;
