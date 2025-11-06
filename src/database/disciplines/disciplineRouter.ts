import express from "express";

import {
    criarDisciplina,
    listarDisciplinas
} from './disciplineController';

const router = express.Router();

router.post('/', criarDisciplina);

router.get('/', listarDisciplinas);

export default router;