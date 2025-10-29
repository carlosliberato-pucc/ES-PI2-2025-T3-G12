import express from 'express';
import {
    criarInstituicao,
    listarInstituicoes,
    atualizarCorInstituicao,
    deletarInstituicao
} from './institutionController';

const router = express.Router();

// ==================== ROTAS DE INSTITUIÇÕES ====================

// POST /api/instituicoes - Criar nova instituição
router.post('/', criarInstituicao);

// GET /api/instituicoes - Listar todas as instituições do usuário
router.get('/', listarInstituicoes);

// PATCH /api/instituicoes/:id/cor - Atualizar cor da instituição
router.patch('/:id/cor', atualizarCorInstituicao);

// DELETE /api/instituicoes/:id - Deletar instituição
router.delete('/:id', deletarInstituicao);

export default router;
