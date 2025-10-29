// Desenvolvido por Carlos Liberato
import { Router } from 'express';
// Importa as funções de autenticação (cadastro e login).
import { register, login, logout, verificarSessao, validarToken, solicitarRecuperacaoSenha, redefinirSenha } from './authController'; 

// Esta variável "router" é que agrupa todas as rotas deste módulo.
const router = Router();

// Quando o servidor recebe uma requisição HTTP do tipo POST para a URL '/register', 
// ele executa a função 'register' que está no authController.
router.post('/register', register);

// Quando o servidor recebe uma requisição HTTP do tipo POST para a URL '/login', 
// ele executa a função 'login' que está no authController.
router.post('/login', login);

router.post('/logout', logout);

router.get('/verificar-sessao', verificarSessao);

// Rotas de recuperação de senha
router.post('/forgot-password', solicitarRecuperacaoSenha);

router.get('/validate-token', validarToken);

router.post('/reset-password', redefinirSenha);

export default router;