import { Request, Response } from 'express';
import { db } from '../index';

// Salvar (inserir/atualizar) nota de um aluno para um componente
export const salvarNota = async (req: Request, res: Response) => {
  try {
    const { matricula, idComponente, valor } = req.body;
    if (!matricula || !idComponente || valor == null) {
      return res.status(400).json({ success: false, message: 'Dados incompletos' });
    }

    db.query(
      `INSERT INTO notas (valor, fk_matricula, fk_compNota)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE valor = VALUES(valor)`,
      [valor, matricula, idComponente],
      (err) => {
        if (err) {
          console.error('Erro ao salvar nota:', err);
          return res.status(500).json({ success: false, message: 'Erro ao salvar nota' });
        }
        res.json({ success: true, message: 'Nota salva com sucesso' });
      }
    );
  } catch (error) {
    console.error('Erro ao salvar nota:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
  }
};

// Buscar todas as notas de uma turma
export const listarNotasTurma = async (req: Request, res: Response) => {
  try {
    const { idTurma } = req.params;
    if (!idTurma) {
      return res.status(400).json({ success: false, message: 'Id da turma não informado' });
    }
    db.query(
      `SELECT a.matricula, a.nome, c.id_compNota, c.sigla, n.valor AS nota
       FROM alunos a
       JOIN turmas t ON t.id_turma = a.fk_turma
       JOIN disciplinas d ON d.id_disciplina = t.fk_disciplina
       JOIN componentes_notas c ON c.fk_disciplina = d.id_disciplina
       LEFT JOIN notas n ON n.fk_matricula = a.matricula AND n.fk_compNota = c.id_compNota
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
