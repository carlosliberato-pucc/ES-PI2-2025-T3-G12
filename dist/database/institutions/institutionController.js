"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletarInstituicao = exports.atualizarCorInstituicao = exports.listarInstituicoes = exports.criarInstituicao = void 0;
const index_1 = require("../index");
// ==================== CRIAR INSTITUIÇÃO ====================
const criarInstituicao = async (req, res) => {
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
        index_1.db.query('SELECT id_usuario FROM usuario WHERE email = ?', [userEmail], (err, userResults) => {
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
            const userId = userResults[0].id_usuario;
            // Inserir instituição
            index_1.db.query('INSERT INTO instituicao (nome, abreviacao, fk_usuario) VALUES (?, ?, ?)', [nome, abreviacao, userId], (insertErr, insertResults) => {
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
            });
        });
    }
    catch (error) {
        console.error('Erro ao criar instituição:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao processar solicitação'
        });
    }
};
exports.criarInstituicao = criarInstituicao;
// ==================== LISTAR INSTITUIÇÕES DO USUÁRIO ====================
const listarInstituicoes = async (req, res) => {
    try {
        const userEmail = req.session.userEmail;
        if (!userEmail) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado'
            });
        }
        // Buscar ID do usuário
        index_1.db.query('SELECT id_usuario FROM usuario WHERE email = ?', [userEmail], (err, userResults) => {
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
            const userId = userResults[0].id_usuario;
            // Buscar instituições do usuário
            index_1.db.query('SELECT id_instituicao, nome, abreviacao FROM instituicao WHERE fk_usuario = ? ORDER BY nome', [userId], (instErr, instituicoes) => {
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
            });
        });
    }
    catch (error) {
        console.error('Erro ao listar instituições:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao processar solicitação'
        });
    }
};
exports.listarInstituicoes = listarInstituicoes;
// ==================== ATUALIZAR COR DA INSTITUIÇÃO ====================
const atualizarCorInstituicao = async (req, res) => {
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
        index_1.db.query(`SELECT i.id_instituicao 
             FROM instituicao i
             INNER JOIN usuario u ON i.fk_usuario = u.id_usuario
             WHERE i.id_instituicao = ? AND u.email = ?`, [id, userEmail], (err, results) => {
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
        });
    }
    catch (error) {
        console.error('Erro ao atualizar cor:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao processar solicitação'
        });
    }
};
exports.atualizarCorInstituicao = atualizarCorInstituicao;
// ==================== DELETAR INSTITUIÇÃO ====================
const deletarInstituicao = async (req, res) => {
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
        index_1.db.query(`DELETE i FROM instituicao i
             INNER JOIN usuario u ON i.fk_usuario = u.id_usuario
             WHERE i.id_instituicao = ? AND u.email = ?`, [id, userEmail], (err, results) => {
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
        });
    }
    catch (error) {
        console.error('Erro ao deletar instituição:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao processar solicitação'
        });
    }
};
exports.deletarInstituicao = deletarInstituicao;
