import { Request, Response } from 'express';
import { db } from '../index';

export const criarDisciplina = async (req: Request, res: Response) => {
    try {
        const { id_instituicao, id_curso, nome, sigla } = req.body;
        const userEmail = req.session.userEmail;

        if(!nome || !id_instituicao || !sigla || !id_curso) {
            return res.status(400).json({
                success: false,
                message: 'Preencher todos os campos é obrigatório é obrigatório'
            });
        }

        db.query(
            `SELECT i.id_instituicao 
             FROM instituicao i
             INNER JOIN usuario u ON i.fk_usuario = u.id_usuario
             WHERE i.id_instituicao = ? AND u.email = ?`,
            [id_instituicao, userEmail],
            (err, results) => {
                if (err) {
                    console.error('Erro ao verificar instituição:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Erro ao processar solicitação'
                    });
                }

                if (!Array.isArray(results) || results.length === 0) {
                    return res.status(403).json({
                        success: false,
                        message: 'Instituição não encontrada ou não pertence ao usuário'
                    });
                }

                db.query(
                    'INSERT INTO disciplinas (nome, sigla, fk_curso) VALUES (?, ?, ?)',
                    [nome, sigla || null, id_curso],
                    (insertErr, insertResults: any) => {
                        if (insertErr) {
                            console.error('Erro ao criar disciplina:', insertErr);
                            return res.status(500).json({
                                success: false,
                                message: 'Erro ao criar disciplina'
                            });
                        }

                        const disciplinasId = insertResults.insertId;

                        console.log(`Curso criado: ${nome} (ID: ${disciplinasId}) no curso ${id_curso}`);

                        res.status(201).json({
                            success: true,
                            message: 'Curso criado com sucesso',
                            data: {
                                id_disciplina: disciplinasId,
                                nome,
                                sigla,
                                fk_curso: id_curso
                            }
                        });
                    }
                );
            }
        )
    } catch (error) {
        console.error('Erro ao criar curso:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao processar a solicitação'
        })
    }
}

export const listarDisciplinas = async (req: Request, res: Response) => {
    try {
        const { id_curso, id_instituicao } = req.query;
        const userEmail = req.session.userEmail;

        if (!userEmail) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado'
            });
        }

        db.query(
            `SELECT i.id_instituicao 
             FROM instituicao i
             INNER JOIN usuario u ON i.fk_usuario = u.id_usuario
             WHERE i.id_instituicao = ? AND u.email = ?`,
            [id_instituicao, userEmail],
            (err, results) => {
                if (err) {
                    console.error('Erro ao verificar instituição:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Erro ao processar solicitação'
                    });
                }

                if (!Array.isArray(results) || results.length === 0) {
                    return res.status(403).json({
                        success: false,
                        message: 'Instituição não encontrada ou não pertence ao usuário'
                    });
                }
                db.query(
                    'SELECT id_disciplina, nome, sigla FROM disciplinas WHERE fk_curso = ? ORDER BY nome',
                    [id_curso],
                    (disciplinaErr, disciplina) => {
                        if (disciplinaErr) {
                            console.error('Erro ao buscar cursos:', disciplinaErr);
                            return res.status(500).json({
                                success: false,
                                message: 'Erro ao buscar disciplina'
                            });
                        }

                        res.json({
                            success: true,
                            data: disciplina
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Erro ao listar disciplinas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao processar solicitação'
        });
    }
};

// Retorna a fórmula (se existir) e os componentes vinculados à disciplina
export const listarFormulaEComponentes = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // id_disciplina
        const userEmail = req.session.userEmail;

        if (!userEmail) {
            return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        }

        // Verificar que a disciplina pertence ao usuário (através da instituicao)
        db.query(
            `SELECT d.id_disciplina, d.fk_formula
             FROM disciplinas d
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

                // Buscar componentes
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

// Salvar ou atualizar a fórmula da disciplina
export const salvarFormula = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // id_disciplina
        const { tipo, expressao, descricao } = req.body;
        const userEmail = req.session.userEmail;

        if (!userEmail) return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        if (!tipo || !expressao) return res.status(400).json({ success: false, message: 'Dados incompletos' });

        // Verificar disciplina pertence ao usuário
        db.query(
            `SELECT d.id_disciplina, d.fk_formula
             FROM disciplinas d
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

                // Buscar componentes para validação
                db.query('SELECT id_compNota, sigla FROM componentes_notas WHERE fk_disciplina = ?', [id], (compErr, compResults: any) => {
                    if (compErr) {
                        console.error('Erro ao buscar componentes:', compErr);
                        return res.status(500).json({ success: false, message: 'Erro ao buscar componentes' });
                    }

                    const componentes: any[] = Array.isArray(compResults) ? compResults : [];
                    const siglas: string[] = componentes.map(c => String(c.sigla));

                    // Extrair tokens da expressão (identificadores)
                    const rawTokens = expressao.match(/[A-Za-z][A-Za-z0-9_]*/g) || [];
                    const tokens: string[] = Array.from(new Set(rawTokens.map((t: string) => String(t))));

                    // Validar que todos tokens referenciem componentes existentes
                    for (const t of tokens) {
                        if (!siglas.includes(String(t))) {
                            return res.status(400).json({ success: false, message: `Token '${t}' não corresponde a nenhum componente cadastrado` });
                        }
                    }

                    // Validações por tipo
                    if (tipo === 'aritmetica') {
                        // arithmetic: no '*' allowed; check division by number equals number of components OR tokens length equals components length
                        if (expressao.includes('*')) {
                            return res.status(400).json({ success: false, message: 'Fórmula aritmética não deve conter multiplicação/ponderação' });
                        }

                        // buscar divisor se existir
                        const divMatch = expressao.match(/\/\s*(\d+)/);
                        if (divMatch) {
                            const div = Number(divMatch[1]);
                            if (div !== componentes.length) {
                                return res.status(400).json({ success: false, message: `Divisor (${div}) diferente da quantidade de componentes (${componentes.length})` });
                            }
                        } else {
                            // if no divisor, ensure tokens count equals components count
                            if (tokens.length !== componentes.length) {
                                return res.status(400).json({ success: false, message: 'Fórmula aritmética não corresponde ao número de componentes cadastrados' });
                            }
                        }
                    } else if (tipo === 'ponderada') {
                        // weighted: expect '*' operator and tokens length equals components length
                        if (!expressao.includes('*')) {
                            return res.status(400).json({ success: false, message: 'Fórmula ponderada deve conter multiplicadores (pesos) usando *' });
                        }

                        if (tokens.length !== componentes.length) {
                            return res.status(400).json({ success: false, message: 'Fórmula ponderada deve referenciar todos os componentes cadastrados' });
                        }
                    } else {
                        return res.status(400).json({ success: false, message: 'Tipo de fórmula inválido' });
                    }

                    // Se chegou aqui, salvar ou atualizar a fórmula
                    const fk_formula = results[0].fk_formula;

                    if (fk_formula) {
                        db.query('UPDATE formula SET expressao = ?, descricao = ?, tipo = ? WHERE id_formula = ?', [expressao, descricao || null, tipo, fk_formula], (upErr) => {
                            if (upErr) {
                                console.error('Erro ao atualizar fórmula:', upErr);
                                return res.status(500).json({ success: false, message: 'Erro ao atualizar fórmula' });
                            }

                            return res.json({ success: true, message: 'Fórmula atualizada com sucesso' });
                        });
                    } else {
                        db.query('INSERT INTO formula (expressao, descricao, tipo) VALUES (?, ?, ?)', [expressao, descricao || null, tipo], (insErr, insRes: any) => {
                            if (insErr) {
                                console.error('Erro ao inserir fórmula:', insErr);
                                return res.status(500).json({ success: false, message: 'Erro ao salvar fórmula' });
                            }

                            const newId = insRes.insertId;
                            db.query('UPDATE disciplinas SET fk_formula = ? WHERE id_disciplina = ?', [newId, id], (uErr) => {
                                if (uErr) {
                                    console.error('Erro ao vincular fórmula à disciplina:', uErr);
                                    return res.status(500).json({ success: false, message: 'Erro ao vincular fórmula' });
                                }

                                return res.json({ success: true, message: 'Fórmula salva com sucesso' });
                            });
                        });
                    }
                });
            }
        );

    } catch (error) {
        console.error('Erro em salvarFormula:', error);
        res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
    }
};

// Listar componentes (já usado na tela)
export const listarComponentes = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userEmail = req.session.userEmail;

        if (!userEmail) return res.status(401).json({ success: false, message: 'Usuário não autenticado' });

        db.query(
            `SELECT d.id_disciplina
             FROM disciplinas d
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

                db.query('SELECT id_compNota, nome, sigla, descricao FROM componentes_notas WHERE fk_disciplina = ? ORDER BY id_compNota', [id], (compErr, componentes) => {
                    if (compErr) {
                        console.error('Erro ao buscar componentes:', compErr);
                        return res.status(500).json({ success: false, message: 'Erro ao buscar componentes' });
                    }

                    return res.json({ success: true, data: componentes });
                });
            }
        );

    } catch (error) {
        console.error('Erro em listarComponentes:', error);
        res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
    }
};

// Criar componente
export const criarComponente = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // id_disciplina
        const { nome, sigla, descricao } = req.body;
        const userEmail = req.session.userEmail;

        if (!userEmail) return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        if (!nome || !sigla) return res.status(400).json({ success: false, message: 'Dados incompletos' });

        db.query(
            `SELECT d.id_disciplina
             FROM disciplinas d
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

                db.query('INSERT INTO componentes_notas (nome, sigla, descricao, fk_disciplina) VALUES (?, ?, ?, ?)', [nome, sigla, descricao || null, id], (insErr, insRes: any) => {
                    if (insErr) {
                        console.error('Erro ao criar componente:', insErr);
                        return res.status(500).json({ success: false, message: 'Erro ao criar componente' });
                    }

                    return res.status(201).json({ success: true, message: 'Componente criado', data: { id_compNota: insRes.insertId, nome, sigla, descricao } });
                });
            }
        );

    } catch (error) {
        console.error('Erro em criarComponente:', error);
        res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
    }
};

// Deletar componente
export const deletarComponente = async (req: Request, res: Response) => {
    try {
        const { id, id_comp } = req.params;
        const userEmail = req.session.userEmail;

        if (!userEmail) return res.status(401).json({ success: false, message: 'Usuário não autenticado' });

        db.query(
            `DELETE cn FROM componentes_notas cn
             INNER JOIN disciplinas d ON cn.fk_disciplina = d.id_disciplina
             INNER JOIN cursos c ON d.fk_curso = c.id_curso
             INNER JOIN instituicao i ON c.fk_instituicao = i.id_instituicao
             INNER JOIN usuario u ON i.fk_usuario = u.id_usuario
             WHERE cn.id_compNota = ? AND d.id_disciplina = ? AND u.email = ?`,
            [id_comp, id, userEmail],
            (delErr, delRes: any) => {
                if (delErr) {
                    console.error('Erro ao deletar componente:', delErr);
                    return res.status(500).json({ success: false, message: 'Erro ao deletar componente' });
                }

                if (delRes.affectedRows === 0) {
                    return res.status(404).json({ success: false, message: 'Componente não encontrado ou sem permissão' });
                }

                return res.json({ success: true, message: 'Componente deletado' });
            }
        );

    } catch (error) {
        console.error('Erro em deletarComponente:', error);
        res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
    }
};
