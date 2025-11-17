// src/controllers/notaFinalController.ts
import { Request, Response } from 'express';
import { db } from '../index';

export const salvarNotaFinal = async (req: Request, res: Response) => {
    console.log('Chegou salvarNotaFinal!', req.body);
  try {
    const { matricula, turma, valor } = req.body;
    const nf = Number(valor);
    if (!matricula || !turma || valor == null || isNaN(nf) || nf<0 || nf>10) {
      return res.status(400).json({ success: false, message: 'Dados inválidos!' });
    }
    db.query(
      `INSERT INTO nota_final (valor, fk_matricula, fk_turma) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE valor = VALUES(valor)`,
      [nf, matricula, turma],
      (err) => {
        if (err) {
          console.error('Erro ao salvar nota final:', err);
          return res.status(500).json({ success: false, message: 'Erro ao salvar nota final' });
        }
        res.json({ success: true, message: 'Nota final salva!' });
      }
    );
  } catch (e) {
    console.error('Falha ao salvar nota final:', e);
    res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
};


// Adicione essa função ao notaFinalController.ts
export const buscarNotasFinais = async (req: Request, res: Response) => {
  try {
    const { turma } = req.params;
    
    if (!turma) {
      return res.status(400).json({ success: false, message: 'ID da turma não fornecido!' });
    }

    db.query(
      `SELECT nf.valor, nf.fk_matricula as matricula, nf.fk_turma as turma
       FROM nota_final nf
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
