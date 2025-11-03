"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarTurmas = exports.criarTurma = void 0;
const index_1 = require("../index");
// ==================== CRIAR TURMA ====================
const criarTurma = async (req, res) => {
    try {
        const { id_instituicao, id_curso, id_disciplina, nome } = req.body;
        const userEmail = req.session.userEmail;
        // Validações
        if (!nome || !id_instituicao || !id_curso || !id_disciplina) {
            return res.status(400).json({
                success: false,
                message: 'Preencher todos os campos é obrigatório'
            });
        }
        if (!userEmail) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado'
            });
        }
        // Verificar se a instituição pertence ao usuário
        index_1.db.query(`SELECT i.id_instituicao 
             FROM instituicao i
             INNER JOIN usuario u ON i.fk_usuario = u.id_usuario
             WHERE i.id_instituicao = ? AND u.email = ?`, [id_instituicao, userEmail], (err, results) => {
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
            // Inserir turma
            index_1.db.query('INSERT INTO turmas (nome, fk_disciplina) VALUES (?, ?)', [nome, id_disciplina], (insertErr, insertResults) => {
                if (insertErr) {
                    console.error('Erro ao criar turma:', insertErr);
                    return res.status(500).json({
                        success: false,
                        message: 'Erro ao criar turma'
                    });
                }
                const turmaId = insertResults.insertId;
                console.log(`Turma criada: ${nome} (ID: ${turmaId}) na disciplina ${id_disciplina}`);
                res.status(201).json({
                    success: true,
                    message: 'Turma criada com sucesso',
                    data: {
                        id_turma: turmaId,
                        nome,
                        fk_disciplina: id_disciplina
                    }
                });
            });
        });
    }
    catch (error) {
        console.error('Erro ao criar turma:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao processar solicitação'
        });
    }
};
exports.criarTurma = criarTurma;
// ==================== LISTAR TURMAS ====================
const listarTurmas = async (req, res) => {
    try {
        const { id_instituicao, id_curso, id_disciplina } = req.query;
        const userEmail = req.session.userEmail;
        if (!userEmail) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado'
            });
        }
        if (!id_instituicao || !id_curso || !id_disciplina) {
            return res.status(400).json({
                success: false,
                message: 'IDs de instituição, curso e disciplina são obrigatórios'
            });
        }
        // Verificar se a instituição pertence ao usuário
        index_1.db.query(`SELECT i.id_instituicao 
             FROM instituicao i
             INNER JOIN usuario u ON i.fk_usuario = u.id_usuario
             WHERE i.id_instituicao = ? AND u.email = ?`, [id_instituicao, userEmail], (err, results) => {
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
            // Buscar turmas da disciplina
            index_1.db.query('SELECT id_turma, nome FROM turmas WHERE fk_disciplina = ? ORDER BY nome', [id_disciplina], (turmasErr, turmas) => {
                if (turmasErr) {
                    console.error('Erro ao buscar turmas:', turmasErr);
                    return res.status(500).json({
                        success: false,
                        message: 'Erro ao buscar turmas'
                    });
                }
                res.json({
                    success: true,
                    data: turmas
                });
            });
        });
    }
    catch (error) {
        console.error('Erro ao listar turmas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao processar solicitação'
        });
    }
};
exports.listarTurmas = listarTurmas;
