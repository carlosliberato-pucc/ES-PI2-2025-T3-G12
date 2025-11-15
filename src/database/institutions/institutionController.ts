import { Request, Response } from 'express';
import { db } from '../index';

export const criarInstituicao = async (req: Request, res: Response) => {
    try {
        const { nome, abreviacao, cor } = req.body;
        const userEmail = req.session.userEmail; // Pega email da sessão

        // Validações
        if (!nome || !abreviacao) {
            return res.status(400).json({
                success: false,
                message: 'Nome e abreviação são obrigatórios'
            });
        }

        if (!userEmail) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado'
            });
        }

        // Busca ID do usuário pelo email
        db.query(
            'SELECT id_usuario FROM usuario WHERE email = ?',
            [userEmail],
            (err, userResults) => {
                if (err) {
                    console.error('Erro ao buscar usuário:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Erro ao processar solicitação'
                    });
                }

                if (!Array.isArray(userResults) || userResults.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Usuário não encontrado'
                    });
                }

                const userId = (userResults[0] as any).id_usuario;

                // Inserir instituição
                db.query(
                    'INSERT INTO instituicao (nome, abreviacao, fk_usuario) VALUES (?, ?, ?)',
                    [nome, abreviacao, userId],
                    (insertErr, insertResults: any) => {
                        if (insertErr) {
                            console.error('Erro ao criar instituição:', insertErr);
                            return res.status(500).json({
                                success: false,
                                message: 'Erro ao criar instituição'
                            });
                        }

                        const instituicaoId = insertResults.insertId;

                        console.log(`Instituição criada: ${nome} (ID: ${instituicaoId})`);

                        res.status(201).json({
                            success: true,
                            message: 'Instituição criada com sucesso',
                            data: {
                                id_instituicao: instituicaoId,
                                nome,
                                abreviacao,
                                cor: cor || 'rgb(10, 61, 183)'
                            }
                        });
                    }
                    
                );
            }
        );

    } catch (error) {
        console.error('Erro ao criar instituição:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao processar solicitação'
        });
    }
};

// lista as instituições
export const listarInstituicoes = async (req: Request, res: Response) => {
    try {
        const userEmail = req.session.userEmail;

        if (!userEmail) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado'
            });
        }

        // Buscar ID do usuário
        db.query(
            'SELECT id_usuario FROM usuario WHERE email = ?',
            [userEmail],
            (err, userResults) => {
                if (err) {
                    console.error('Erro ao buscar usuário:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Erro ao processar solicitação'
                    });
                }

                if (!Array.isArray(userResults) || userResults.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Usuário não encontrado'
                    });
                }

                const userId = (userResults[0] as any).id_usuario;

                // Buscar instituições do usuário
                db.query(
                    'SELECT id_instituicao, nome, abreviacao FROM instituicao WHERE fk_usuario = ? ORDER BY nome',
                    [userId],
                    (instErr, instituicoes) => {
                        if (instErr) {
                            console.error('Erro ao buscar instituições:', instErr);
                            return res.status(500).json({
                                success: false,
                                message: 'Erro ao buscar instituições'
                            });
                        }

                        res.json({
                            success: true,
                            data: instituicoes
                        });
                    }
                );
            }
        );

    } catch (error) {
        console.error('Erro ao listar instituições:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao processar solicitação'
        });
    }
};

// deleta a instituição
export const deletarInstituicao = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userEmail = req.session.userEmail;

        if (!userEmail) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado'
            });
        }

        // Verificar se a instituição tem cursos vinculados
        db.query(
            `SELECT COUNT(*) as total FROM cursos WHERE fk_instituicao = ?`,
            [id],
            (countErr, countResults: any) => {
                if (countErr) {
                    console.error('Erro ao verificar cursos:', countErr);
                    return res.status(500).json({
                        success: false,
                        message: 'Erro ao processar solicitação'
                    });
                }

                const totalCursos = countResults[0].total;

                if (totalCursos > 0) {
                    return res.status(400).json({
                        success: false,
                        message: `Não é possível deletar esta instituição. Existem ${totalCursos} curso(s) vinculado(s). Exclua os cursos primeiro.`
                    });
                }

                // Verificar se a instituição pertence ao usuário e deletar
                db.query(
                    `DELETE i FROM instituicao i
                     INNER JOIN usuario u ON i.fk_usuario = u.id_usuario
                     WHERE i.id_instituicao = ? AND u.email = ?`,
                    [id, userEmail],
                    (err, results: any) => {
                        if (err) {
                            console.error('Erro ao deletar instituição:', err);
                            return res.status(500).json({
                                success: false,
                                message: 'Erro ao deletar instituição'
                            });
                        }

                        if (results.affectedRows === 0) {
                            return res.status(404).json({
                                success: false,
                                message: 'Instituição não encontrada ou não pertence ao usuário'
                            });
                        }

                        console.log(`Instituição deletada: ID ${id}`);

                        res.json({
                            success: true,
                            message: 'Instituição deletada com sucesso'
                        });
                    }
                );
            }
        );

    } catch (error) {
        console.error('Erro ao deletar instituição:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao processar solicitação'
        });
    }
};

// Lista um resumo por instituição contendo sigla, nomes dos cursos, total de disciplinas e total de turmas
export const listarResumoInstituicoes = async (req: Request, res: Response) => {
    try {
        const userEmail = req.session.userEmail;

        if (!userEmail) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado'
            });
        }

        // A query retorna uma linha por (instituição, curso) com contagens de disciplinas e turmas
        const sql = `
            SELECT
                i.id_instituicao,
                i.nome,
                i.abreviacao,
                c.id_curso,
                c.nome AS curso,
                COUNT(DISTINCT d.id_disciplina) AS total_disciplinas,
                COUNT(DISTINCT t.id_turma) AS total_turmas
            FROM instituicao i
            INNER JOIN usuario u ON i.fk_usuario = u.id_usuario
            LEFT JOIN cursos c ON c.fk_instituicao = i.id_instituicao
            LEFT JOIN disciplinas d ON d.fk_curso = c.id_curso
            LEFT JOIN turmas t ON t.fk_disciplina = d.id_disciplina
            WHERE u.email = ?
            GROUP BY i.id_instituicao, c.id_curso
            ORDER BY i.nome, c.nome
        `;

        db.query(sql, [userEmail], (err, results) => {
            if (err) {
                console.error('Erro ao buscar resumo das instituições:', err);
                return res.status(500).json({ success: false, message: 'Erro ao buscar resumo' });
            }

            res.json({ success: true, data: results });
        });

    } catch (error) {
        console.error('Erro ao listar resumo das instituições:', error);
        res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
    }
};
