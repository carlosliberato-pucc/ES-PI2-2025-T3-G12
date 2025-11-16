import { Request, Response } from 'express';
import { db } from '../index';

export const listarComponentes = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // id_disciplina
    db.query('SELECT id_compNota, nome, sigla, descricao FROM componentes_notas WHERE fk_disciplina = ? ORDER BY id_compNota', [id], (err, componentes) => {
      if (err) {
        console.error('Erro ao buscar componentes:', err);
        return res.status(500).json({ success: false, message: 'Erro ao buscar componentes' });
      }
      return res.json({ success: true, data: componentes });
    });
  } catch (error) {
    console.error('Erro em listarComponentes:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
  }
};
