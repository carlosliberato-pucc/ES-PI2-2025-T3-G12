import express from 'express';
import { salvarNotaFinal } from './notaFinalController';

const router = express.Router();

router.post('/', salvarNotaFinal);

export default router;
