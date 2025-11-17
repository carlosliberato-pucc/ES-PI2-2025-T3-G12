// Desenvolvido por Carlos Liberato
// Desenvolvido por Felipe Miranda (Sessão e recuperação de senha)

import { Router } from 'express';
import {
  register,
  login,
  logout,
  verificarSessao,
  validarToken,
  solicitarRecuperacaoSenha,
  redefinirSenha
} from './authController';

const router = Router();

// Cadastro de usuário
router.post('/register', register);

// Login do usuário
router.post('/login', login);

// Logout
router.post('/logout', logout);

// Verifica se sessão está ativa
router.get('/verificar-sessao', verificarSessao);

// Envia e-mail para recuperação de senha
router.post('/forgot-password', solicitarRecuperacaoSenha);

// Valida token do link enviado para redefinição
router.get('/validate-token', validarToken);

// Redefinindo a senha
router.post('/reset-password', redefinirSenha);

export default router;
