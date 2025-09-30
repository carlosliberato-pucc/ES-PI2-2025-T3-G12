// Desenvolvido por Carlos Liberato
import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
// Importando Conexão com o banco de dados
import { db } from '../index'; 

// Função de cadastro
export const register = async (req: Request, res: Response) => {
    //Extraindo os dados dos inputs
    const { nome, email, telefone, senha } = req.body;

    //Validação dos campos. Verifica se todos os campos foram preenchidos.
    if (!nome || !email || !telefone || !senha) {
        return res.status(400).send('Preencha todos os campos');
    }

    try {
        //Criação do hash (criptografia) com o bcrypt.
        const hash = await bcrypt.hash(senha, 10);

        //Comandos SQL para inserir usuário
        db.query(
            'INSERT INTO usuario (nome, email, telefone, senha) VALUES (?, ?, ?, ?)', // ? para segurança
            [nome, email, telefone, hash],
            (err) => {
                if (err) {
                    //Tratamento de erro para chave duplicada Erro_Duplicada_Entrada
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).send('E-mail já cadastrado');
                    }
                    console.error('Erro ao cadastrar usuário: ', err);
                    return res.status(500).send('Erro ao cadastrar usuário');
                }
                //Se não tiver erros, Cadastro realizado
                res.send('Cadastro realizado com sucesso!');
            }
        );
    } catch (error) {
        //Tratamento de erros do servidor. 
        console.error('Erro no servidor durante o cadastro: ', error);
        res.status(500).send('Erro no servidor');
    }
};

//Função de login
export const login = (req: Request, res: Response) => {
    //Extraindo dados dos campos.
    const { email, senha } = req.body;

    //Verifica se os campos foram preenchidos.
    if (!email || !senha) {
        return res.status(400).send('Preencha todos os campos');
    }

    //Comandos do SQL para selecionar usuário
    db.query('SELECT * FROM usuario WHERE email = ?', [email], async (err, results: any[]) => {
        if (err) {
            //Valida dados de email
            //Se erro no servidor, retorna como erro do servidor.
            console.error('Erro no servidor durante o login: ', err);
            return res.status(500).send('Erro no servidor');
        }

        if (results.length === 0) {
            //Valida dados de email
            //Se os dados não foram encontrados, retorna uma mensagem.
            return res.status(401).send('E-mail ou senha incorretos.');
        }

        const user = results[0];

        //Compara a senha fornecida com o hash armazenado.
        const match = await bcrypt.compare(senha, user.senha); 

        //Se a senha estiver incorreta, retorna uma mensagem.
        if (!match) {
            return res.status(401).send('E-mail ou senha incorretos.');
        }

        res.send('Login realizado');
    });
};