// Desenvolvido por Carlos Liberato
import { Router } from 'express';
// Importa as funções de autenticação (cadastro e login).
import { register, login } from './authController'; 

// Esta variável "router" é que agrupa todas as rotas deste módulo.
const router = Router();

// Quando o servidor recebe uma requisição HTTP do tipo POST para a URL '/register', 
// ele executa a função 'register' que está no authController.
router.post('/register', register);

// Quando o servidor recebe uma requisição HTTP do tipo POST para a URL '/login', 
// ele executa a função 'login' que está no authController.
router.post('/login', login);

export default router;