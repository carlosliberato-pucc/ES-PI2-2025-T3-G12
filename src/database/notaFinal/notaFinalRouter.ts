import express from 'express';
import { salvarNotaFinal, buscarNotasFinais } from './notaFinalController';

const router = express.Router();

router.post('/', salvarNotaFinal);
router.get('/:turma', buscarNotasFinais);  // Nova rota GET

export default router;
