// Desenvolvido por Carlos Liberato (Salvar e Listar Notas de Alunos)

import { Request, Response } from 'express';
import { db } from '../index';

// Salva ou atualiza nota de um aluno para um componente
export const salvarNota = async (req: Request, res: Response) => {
  try {
    const { matricula, idComponente, valor } = req.body;
    if (!matricula || !idComponente || valor == null) {
      return res.status(400).json({ success: false, message: 'Dados incompletos' });
    }

    const numValor = Number(valor);
    if (isNaN(numValor) || numValor < 0 || numValor > 10) {
      return res.status(400).json({ success: false, message: 'Nota deve ser um número de 0 a 10' });
    }

    // Busca aluno pela matrícula antes de inserir/atualizar nota
    db.query(
      'SELECT id FROM alunos WHERE matricula = ? LIMIT 1',
      [matricula],
      (err, rows: any[]) => {
        if (err) {
          console.error('Erro ao buscar aluno pela matrícula:', err);
          return res.status(500).json({ success: false, message: 'Erro ao buscar aluno' });
        }
        if (!rows || rows.length === 0) {
          return res.status(404).json({ success: false, message: 'Aluno não encontrado para esta matrícula' });
        }
        const idAluno = rows[0].id as number;

        // Insere/atualiza nota
        db.query(
          `INSERT INTO notas (valor, fk_id_aluno, fk_compNota)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE valor = VALUES(valor)`,
          [numValor, idAluno, idComponente],
          (err2) => {
            if (err2) {
              console.error('Erro ao salvar nota:', err2);
              return res.status(500).json({ success: false, message: 'Erro ao salvar nota' });
            }
            res.json({ success: true, message: 'Nota salva com sucesso' });
          }
        );
      }
    );
  } catch (error) {
    console.error('Erro ao salvar nota:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
  }
};

// Lista todas as notas de uma turma, agrupadas por aluno e componente
export const listarNotasTurma = async (req: Request, res: Response) => {
  try {
    const { idTurma } = req.params;
    if (!idTurma) {
      return res.status(400).json({ success: false, message: 'Id da turma não informado' });
    }

    db.query(
      `SELECT a.matricula, a.nome, c.id_compNota, c.sigla, n.valor AS nota
         FROM alunos a
         JOIN turmas t            ON t.id_turma      = a.fk_turma
         JOIN disciplinas d       ON d.id_disciplina = t.fk_disciplina
         JOIN componentes_notas c ON c.fk_disciplina = d.id_disciplina
         LEFT JOIN notas n        ON n.fk_id_aluno   = a.id
                                   AND n.fk_compNota  = c.id_compNota
       WHERE t.id_turma = ?
       ORDER BY a.nome, c.id_compNota`,
      [idTurma],
      (err, rows) => {
        if (err) {
          console.error('Erro ao buscar notas:', err);
          return res.status(500).json({ success: false, message: 'Erro ao buscar notas' });
        }
        res.json({ success: true, data: rows });
      }
    );
  } catch (error) {
    console.error('Erro ao buscar notas:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
  }
};
