import { Request, Response } from 'express';
import { db } from '../index';

// ==================== CRIAR INSTITUIÇÃO ====================
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

        // Buscar ID do usuário pelo email
        db.query(
            'SELECT id_usuario FROM usuario WHERE email = ?',
            [userEmail],
            (err, userResults) => {
                if (err) {
                    console.error('❌ Erro ao buscar usuário:', err);
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
                    'INSERT INTO instituicao (nome, fk_usuario) VALUES (?, ?)',
                    [nome, userId],
                    (insertErr, insertResults: any) => {
                        if (insertErr) {
                            console.error('❌ Erro ao criar instituição:', insertErr);
                            return res.status(500).json({
                                success: false,
                                message: 'Erro ao criar instituição'
                            });
                        }

                        const instituicaoId = insertResults.insertId;

                        console.log(`✅ Instituição criada: ${nome} (ID: ${instituicaoId})`);

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
        console.error('❌ Erro ao criar instituição:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao processar solicitação'
        });
    }
};

// ==================== LISTAR INSTITUIÇÕES DO USUÁRIO ====================
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
                    console.error('❌ Erro ao buscar usuário:', err);
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
                    'SELECT id_instituicao, nome FROM instituicao WHERE fk_usuario = ? ORDER BY nome',
                    [userId],
                    (instErr, instituicoes) => {
                        if (instErr) {
                            console.error('❌ Erro ao buscar instituições:', instErr);
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
        console.error('❌ Erro ao listar instituições:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao processar solicitação'
        });
    }
};

// ==================== ATUALIZAR COR DA INSTITUIÇÃO ====================
export const atualizarCorInstituicao = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { cor } = req.body;
        const userEmail = req.session.userEmail;

        if (!userEmail) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado'
            });
        }

        if (!cor) {
            return res.status(400).json({
                success: false,
                message: 'Cor é obrigatória'
            });
        }

        // Verificar se a instituição pertence ao usuário
        db.query(
            `SELECT i.id_instituicao 
             FROM instituicao i
             INNER JOIN usuario u ON i.fk_usuario = u.id_usuario
             WHERE i.id_instituicao = ? AND u.email = ?`,
            [id, userEmail],
            (err, results) => {
                if (err) {
                    console.error('Erro ao verificar instituição:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Erro ao processar solicitação'
                    });
                }

                if (!Array.isArray(results) || results.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Instituição não encontrada ou não pertence ao usuário'
                    });
                }

                // Por enquanto, apenas retorna sucesso
                // A cor será salva no localStorage no frontend
                res.json({
                    success: true,
                    message: 'Cor atualizada com sucesso'
                });
            }
        );

    } catch (error) {
        console.error('Erro ao atualizar cor:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao processar solicitação'
        });
    }
};

// ==================== DELETAR INSTITUIÇÃO ====================
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

        // Verificar se a instituição pertence ao usuário e deletar
        db.query(
            `DELETE i FROM instituicao i
             INNER JOIN usuario u ON i.fk_usuario = u.id_usuario
             WHERE i.id_instituicao = ? AND u.email = ?`,
            [id, userEmail],
            (err, results: any) => {
                if (err) {
                    console.error('❌ Erro ao deletar instituição:', err);
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

                console.log(`✅ Instituição deletada: ID ${id}`);

                res.json({
                    success: true,
                    message: 'Instituição deletada com sucesso'
                });
            }
        );

    } catch (error) {
        console.error('❌ Erro ao deletar instituição:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao processar solicitação'
        });
    }
};
