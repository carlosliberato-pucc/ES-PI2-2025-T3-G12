import { Request, Response } from 'express';
import { db } from '../index';

// Criar aluno
export const criarAluno = (req: Request, res: Response) => {
  try {
    const { matricula, nome } = req.body;
    const fk_turma = Number(req.params.id); // id da turma na rota

    if (!matricula || !nome) {
      return res.status(400).json({
        success: false,
        message: 'Preencher todos os campos é obrigatório'
      });
    }

    db.query(
      'INSERT INTO alunos (matricula, nome, fk_turma) VALUES (?, ?, ?)',
      [matricula, nome, fk_turma],
      (err, result) => {
        if (err) {
          console.error('Erro ao criar aluno:', err);
          return res.status(500).json({ success: false, message: 'Erro ao criar aluno' });
        }
        res.status(201).json({ success: true, message: 'Aluno criado com sucesso' });
      }
    );
  } catch (error) {
    console.error('Erro ao criar aluno:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
  }
};

// Listar alunos (de uma turma)
export const listarAlunos = (req: Request, res: Response) => {
  try {
    const fk_turma = Number(req.params.id);
    db.query(
      'SELECT matricula, nome FROM alunos WHERE fk_turma = ? ORDER BY nome',
      [fk_turma],
      (err, alunos) => {
        if (err) {
          console.error('Erro ao buscar alunos:', err);
          return res.status(500).json({ success: false, message: 'Erro ao buscar alunos' });
        }
        res.json({ success: true, data: alunos });
      }
    );
  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
  }
};
