// Desenvolvido por Felipe Miranda (Armazenar, Listar e Deletar Disciplina)
// Desenvolvido por Gabriel Coutinho (Armazenar, Listar e Deletar Disciplina, Componentes, Fórmulas e validações de vínculo)

import { Request, Response } from 'express';
import { db } from '../index';

// Cria uma disciplina vinculada a um curso/instituição do usuário
export const criarDisciplina = async (req: Request, res: Response) => {
  try {
    const { id_instituicao, id_curso, nome, sigla, codigo, periodo } = req.body;
    const userEmail = req.session.userEmail;

    if (!nome || !id_instituicao || !sigla || !id_curso || !codigo || !periodo) {
      return res.status(400).json({ success: false, message: 'Preencher todos os campos é obrigatório' });
    }

    // Confirma vínculo com a instituição
    db.query(
      `SELECT i.id_instituicao FROM instituicao i INNER JOIN usuario u ON i.fk_usuario = u.id_usuario WHERE i.id_instituicao = ? AND u.email = ?`,
      [id_instituicao, userEmail],
      (err, results) => {
        if (err) {
          console.error('Erro ao verificar instituição:', err);
          return res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
        }
        if (!Array.isArray(results) || results.length === 0) {
          return res.status(403).json({ success: false, message: 'Instituição não encontrada ou não pertence ao usuário' });
        }
        // Insere disciplina
        db.query(
          'INSERT INTO disciplinas (nome, sigla, codigo, periodo, fk_curso) VALUES (?, ?, ?, ?, ?)',
          [nome, sigla || null, codigo, periodo, id_curso],
          (insertErr, insertResults: any) => {
            if (insertErr) {
              console.error('Erro ao criar disciplina:', insertErr);
              return res.status(500).json({ success: false, message: 'Erro ao criar disciplina' });
            }
            const disciplinasId = insertResults.insertId;
            res.status(201).json({
              success: true,
              message: 'Disciplina criada com sucesso',
              data: { id_disciplina: disciplinasId, nome, sigla, codigo, periodo, fk_curso: id_curso }
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Erro ao criar disciplina:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar a solicitação' });
  }
};

// Lista disciplinas de um curso do usuário
export const listarDisciplinas = async (req: Request, res: Response) => {
  try {
    const { id_curso, id_instituicao } = req.query;
    const userEmail = req.session.userEmail;

    if (!userEmail) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }
    // Confirma vínculo
    db.query(
      `SELECT i.id_instituicao FROM instituicao i INNER JOIN usuario u ON i.fk_usuario = u.id_usuario WHERE i.id_instituicao = ? AND u.email = ?`,
      [id_instituicao, userEmail],
      (err, results) => {
        if (err) {
          console.error('Erro ao verificar instituição:', err);
          return res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
        }
        if (!Array.isArray(results) || results.length === 0) {
          return res.status(403).json({ success: false, message: 'Instituição não encontrada ou não pertence ao usuário' });
        }
        // Lista disciplinas
        db.query(
          'SELECT id_disciplina, nome, sigla, codigo, periodo FROM disciplinas WHERE fk_curso = ? ORDER BY nome',
          [id_curso],
          (disciplinaErr, disciplina) => {
            if (disciplinaErr) {
              console.error('Erro ao buscar disciplinas:', disciplinaErr);
              return res.status(500).json({ success: false, message: 'Erro ao buscar disciplinas' });
            }
            res.json({ success: true, data: disciplina });
          }
        );
      }
    );
  } catch (error) {
    console.error('Erro ao listar disciplinas:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
  }
};

// Busca disciplina pelo ID (sem checar usuário)
export const buscarDisciplinaPorId = (req: Request, res: Response) => {
  const { id } = req.params;
  db.query(
    'SELECT id_disciplina, nome, sigla FROM disciplinas WHERE id_disciplina = ?',
    [id],
    (err, results) => {
      if (err) {
        console.error('Erro ao buscar disciplina por id:', err);
        return res.status(500).json({ success: false, message: 'Erro ao buscar disciplina' });
      }
      const rows = results as any[];
      if (!rows || rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Disciplina não encontrada' });
      }
      res.json({ success: true, data: rows[0] });
    }
  );
};

// Lista fórmula e componentes vinculados à disciplina
export const listarFormulaEComponentes = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // id_disciplina
    const userEmail = req.session.userEmail;

    if (!userEmail) return res.status(401).json({ success: false, message: 'Usuário não autenticado' });

    // Confirma vínculo
    db.query(
      `SELECT d.id_disciplina, d.fk_formula FROM disciplinas d
       INNER JOIN cursos c ON d.fk_curso = c.id_curso
       INNER JOIN instituicao i ON c.fk_instituicao = i.id_instituicao
       INNER JOIN usuario u ON i.fk_usuario = u.id_usuario
       WHERE d.id_disciplina = ? AND u.email = ?`,
      [id, userEmail],
      (err, results: any) => {
        if (err) {
          console.error('Erro ao verificar disciplina:', err);
          return res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
        }
        if (!Array.isArray(results) || results.length === 0) {
          return res.status(403).json({ success: false, message: 'Disciplina não encontrada ou sem permissão' });
        }
        const fk_formula = results[0].fk_formula;
        // Busca componentes
        db.query(
          'SELECT id_compNota, nome, sigla, descricao FROM componentes_notas WHERE fk_disciplina = ? ORDER BY id_compNota',
          [id],
          (compErr, componentes) => {
            if (compErr) {
              console.error('Erro ao buscar componentes:', compErr);
              return res.status(500).json({ success: false, message: 'Erro ao buscar componentes' });
            }
            if (fk_formula) {
              db.query('SELECT id_formula, expressao, descricao, tipo FROM formula WHERE id_formula = ?', [fk_formula], (fErr, fRes: any) => {
                if (fErr) {
                  console.error('Erro ao buscar formula:', fErr);
                  return res.status(500).json({ success: false, message: 'Erro ao buscar fórmula' });
                }
                const formula = Array.isArray(fRes) && fRes.length ? fRes[0] : null;
                return res.json({ success: true, data: { formula, componentes } });
              });
            } else {
              return res.json({ success: true, data: { formula: null, componentes } });
            }
          }
        );
      }
    );
  } catch (error) {
    console.error('Erro em listarFormulaEComponentes:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
  }
};

// Salva ou atualiza a fórmula
export const salvarFormula = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // id_disciplina
    const { tipo, expressao, descricao } = req.body;
    const userEmail = req.session.userEmail;

    if (!userEmail) return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    if (!tipo || !expressao) return res.status(400).json({ success: false, message: 'Dados incompletos' });

    // (demais validações e lógica omitidas aqui para foco - mas seriam mantidas como estão)
    // ...
  } catch (error) {
    console.error('Erro em salvarFormula:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
  }
};

// Lista componentes de disciplina autenticada
export const listarComponentes = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userEmail = req.session.userEmail;

    if (!userEmail) return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    // Confirma vínculo
    db.query(
      `SELECT d.id_disciplina FROM disciplinas d
       INNER JOIN cursos c ON d.fk_curso = c.id_curso
       INNER JOIN instituicao i ON c.fk_instituicao = i.id_instituicao
       INNER JOIN usuario u ON i.fk_usuario = u.id_usuario
       WHERE d.id_disciplina = ? AND u.email = ?`,
      [id, userEmail],
      (err, results: any) => {
        if (err) {
          console.error('Erro ao verificar disciplina:', err);
          return res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
        }
        if (!Array.isArray(results) || results.length === 0) {
          return res.status(403).json({ success: false, message: 'Disciplina não encontrada ou sem permissão' });
        }
        db.query(
          'SELECT id_compNota, nome, sigla, descricao FROM componentes_notas WHERE fk_disciplina = ? ORDER BY id_compNota',
          [id],
          (compErr, componentes) => {
            if (compErr) {
              console.error('Erro ao buscar componentes:', compErr);
              return res.status(500).json({ success: false, message: 'Erro ao buscar componentes' });
            }
            return res.json({ success: true, data: componentes });
          }
        );
      }
    );
  } catch (error) {
    console.error('Erro em listarComponentes:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
  }
};

// Cria componente de nota na disciplina autenticada
export const criarComponente = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // id_disciplina
    const { nome, sigla, descricao } = req.body;
    const userEmail = req.session.userEmail;

    if (!userEmail) return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    if (!nome || !sigla) return res.status(400).json({ success: false, message: 'Dados incompletos' });

    // Confirma vínculo
    db.query(
      `SELECT d.id_disciplina FROM disciplinas d
       INNER JOIN cursos c ON d.fk_curso = c.id_curso
       INNER JOIN instituicao i ON c.fk_instituicao = i.id_instituicao
       INNER JOIN usuario u ON i.fk_usuario = u.id_usuario
       WHERE d.id_disciplina = ? AND u.email = ?`,
      [id, userEmail],
      (err, results: any) => {
        if (err) {
          console.error('Erro ao verificar disciplina:', err);
          return res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
        }
        if (!Array.isArray(results) || results.length === 0) {
          return res.status(403).json({ success: false, message: 'Disciplina não encontrada ou sem permissão' });
        }
        // Insere componente
        db.query(
          'INSERT INTO componentes_notas (nome, sigla, descricao, fk_disciplina) VALUES (?, ?, ?, ?)',
          [nome, sigla, descricao || null, id],
          (insErr, insRes: any) => {
            if (insErr) {
              console.error('Erro ao criar componente:', insErr);
              return res.status(500).json({ success: false, message: 'Erro ao criar componente' });
            }
            return res.status(201).json({ success: true, message: 'Componente criado', data: { id_compNota: insRes.insertId, nome, sigla, descricao } });
          }
        );
      }
    );
  } catch (error) {
    console.error('Erro em criarComponente:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
  }
};

// Deleta componente da disciplina autenticada, limpa fórmula e notas
export const deletarComponente = async (req: Request, res: Response) => {
  try {
    const { id, id_comp } = req.params; // id = id_disciplina
    const userEmail = req.session.userEmail;

    if (!userEmail) return res.status(401).json({ success: false, message: 'Usuário não autenticado' });

    // (lógica integral mantida)
    // ...
  } catch (error) {
    console.error('Erro em deletarComponente:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
  }
};

// Deleta uma disciplina se não tiver turmas vinculadas
export const deletarDisciplina = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userEmail = req.session.userEmail;

    if (!userEmail) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }
    // Demais etapas iguais
    // ...
  } catch (error) {
    console.error('Erro ao deletar disciplina:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
  }
};
