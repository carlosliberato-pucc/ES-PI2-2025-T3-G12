// Desenvolvido por Felipe Miranda (Armazenar, Listar e Deletar Curso)

import express from 'express';
import {
    criarCurso,
    listarCursos,
    deletarCurso
} from './courseController';

const router = express.Router();

// Método para criar curso
router.post('/', criarCurso);

// Método para listar os cursos
router.get('/', listarCursos);

// Método para deletar os cursos
router.delete('/:id_curso', deletarCurso);

export default router;