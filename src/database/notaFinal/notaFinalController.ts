// Desenvolvido por Carlos Liberato (Salvar e Buscar Notas Finais)

import { Request, Response } from 'express';
import { db } from '../index';

// Salva ou atualiza a nota final de um aluno em uma turma
export const salvarNotaFinal = async (req: Request, res: Response) => {
  try {
    const { matricula, turma, valor } = req.body;
    const nf = Number(valor);

    // Validação básica dos dados recebidos
    if (!matricula || !turma || valor == null || isNaN(nf) || nf < 0 || nf > 10) {
      return res.status(400).json({ success: false, message: 'Dados inválidos!' });
    }

    // Busca aluno pela matrícula
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

        // Insere ou atualiza nota final
        db.query(
          `INSERT INTO nota_final (valor, fk_id_aluno, fk_turma)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE valor = VALUES(valor)`,
          [nf, idAluno, turma],
          (err2) => {
            if (err2) {
              console.error('Erro ao salvar nota final:', err2);
              return res.status(500).json({ success: false, message: 'Erro ao salvar nota final' });
            }
            res.json({ success: true, message: 'Nota final salva!' });
          }
        );
      }
    );
  } catch (e) {
    console.error('Falha ao salvar nota final:', e);
    res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
};

// Lista todas as notas finais de uma turma
export const buscarNotasFinais = async (req: Request, res: Response) => {
  try {
    const { turma } = req.params;
    if (!turma) {
      return res.status(400).json({ success: false, message: 'ID da turma não fornecido!' });
    }

    // Junta notas finais com matrícula do aluno
    db.query(
      `SELECT nf.valor,
              a.matricula AS matricula,
              nf.fk_turma AS turma
        FROM nota_final nf
        JOIN alunos a ON a.id = nf.fk_id_aluno
       WHERE nf.fk_turma = ?`,
      [turma],
      (err, results) => {
        if (err) {
          console.error('Erro ao buscar notas finais:', err);
          return res.status(500).json({ success: false, message: 'Erro ao buscar notas finais' });
        }
        res.json({ success: true, data: results });
      }
    );
  } catch (e) {
    console.error('Falha ao buscar notas finais:', e);
    res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
};
