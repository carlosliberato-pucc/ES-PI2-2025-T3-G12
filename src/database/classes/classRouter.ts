import express from 'express';
import {
    criarTurma,
    listarTurmas,
    deletarTurma
} from './classController';

const router = express.Router();


// POST /api/turmas - Criar turma
// Body: { id_instituicao, id_curso, id_disciplina, nome }
router.post('/', criarTurma);

// GET /api/turmas?id_instituicao=X&id_curso=Y&id_disciplina=Z - Listar turmas
router.get('/', listarTurmas);

router.delete('/:id', deletarTurma);

export default router;