import express from 'express';
import { listarComponentes } from './componentesController';

const router = express.Router();

router.get('/:id', listarComponentes); // id da disciplina

export default router;
