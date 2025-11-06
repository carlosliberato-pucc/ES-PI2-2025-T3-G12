import express from 'express';
import {
    criarCurso,
    listarCursos,
    deletarCurso
} from './courseController';

const router = express.Router();

//rotas
router.post('/', criarCurso);

router.get('/', listarCursos);

router.delete('/:id_curso', deletarCurso);

export default router;