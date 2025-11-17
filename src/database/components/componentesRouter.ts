// Desenvolvido por Carlos Liberato (Rotas de Componentes de Nota)

import express from 'express';
import { listarComponentes } from './componentesController';

const router = express.Router();
// lista os componentes
router.get('/:id', listarComponentes); // id da disciplina

export default router;
