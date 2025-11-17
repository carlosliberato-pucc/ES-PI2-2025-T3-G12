import express from 'express';
import { salvarNotaFinal, buscarNotasFinais } from './notaFinalController';

const router = express.Router();

// Salva nota final para um aluno na turma
router.post('/', salvarNotaFinal);

// Lista todas as notas finais de uma turma
router.get('/:turma', buscarNotasFinais);

export default router;
