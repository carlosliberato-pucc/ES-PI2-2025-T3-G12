"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarTurmaPorId = exports.deletarTurma = exports.listarTurmas = exports.criarTurma = void 0;
const index_1 = require("../index");
// Cria uma turma se a instituição pertencer ao usuário logado
const criarTurma = async (req, res) => {
    try {
        const { id_instituicao, id_curso, id_disciplina, nome } = req.body;
        const userEmail = req.session.userEmail;
        // Checa dados obrigatórios e autenticação
        if (!nome || !id_instituicao || !id_curso || !id_disciplina) {
            return res.status(400).json({ success: false, message: 'Preencher todos os campos é obrigatório' });
        }
        if (!userEmail) {
            return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        }
        // Verifica vínculo do usuário à instituição
        index_1.db.query(`SELECT i.id_instituicao FROM instituicao i
       INNER JOIN usuario u ON i.fk_usuario = u.id_usuario
       WHERE i.id_instituicao = ? AND u.email = ?`, [id_instituicao, userEmail], (err, results) => {
            if (err) {
                console.error('Erro ao verificar instituição:', err);
                return res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
            }
            if (!Array.isArray(results) || results.length === 0) {
                return res.status(403).json({ success: false, message: 'Instituição não encontrada ou não pertence ao usuário' });
            }
            // Cria turma
            index_1.db.query('INSERT INTO turmas (nome, fk_disciplina) VALUES (?, ?)', [nome, id_disciplina], (insertErr, insertResults) => {
                if (insertErr) {
                    console.error('Erro ao criar turma:', insertErr);
                    return res.status(500).json({ success: false, message: 'Erro ao criar turma' });
                }
                const turmaId = insertResults.insertId;
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
        res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
    }
};
exports.criarTurma = criarTurma;
// Lista turmas de uma disciplina, valida vínculo do usuário
const listarTurmas = async (req, res) => {
    try {
        const { id_instituicao, id_curso, id_disciplina } = req.query;
        const userEmail = req.session.userEmail;
        if (!userEmail) {
            return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        }
        if (!id_instituicao || !id_curso || !id_disciplina) {
            return res.status(400).json({ success: false, message: 'IDs de instituição, curso e disciplina são obrigatórios' });
        }
        // Confirma vínculo usuário/instituição
        index_1.db.query(`SELECT i.id_instituicao FROM instituicao i
       INNER JOIN usuario u ON i.fk_usuario = u.id_usuario
       WHERE i.id_instituicao = ? AND u.email = ?`, [id_instituicao, userEmail], (err, results) => {
            if (err) {
                console.error('Erro ao verificar instituição:', err);
                return res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
            }
            if (!Array.isArray(results) || results.length === 0) {
                return res.status(403).json({ success: false, message: 'Instituição não encontrada ou não pertence ao usuário' });
            }
            // Busca turmas
            index_1.db.query('SELECT id_turma, nome FROM turmas WHERE fk_disciplina = ? ORDER BY nome', [id_disciplina], (turmasErr, turmas) => {
                if (turmasErr) {
                    console.error('Erro ao buscar turmas:', turmasErr);
                    return res.status(500).json({ success: false, message: 'Erro ao buscar turmas' });
                }
                res.json({ success: true, data: turmas });
            });
        });
    }
    catch (error) {
        console.error('Erro ao listar turmas:', error);
        res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
    }
};
exports.listarTurmas = listarTurmas;
// Deleta turma se pertencer ao usuário
const deletarTurma = async (req, res) => {
    try {
        const { id } = req.params;
        const userEmail = req.session.userEmail;
        if (!userEmail) {
            return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        }
        index_1.db.query(`DELETE t FROM turmas t
       INNER JOIN disciplinas d ON t.fk_disciplina = d.id_disciplina
       INNER JOIN cursos c ON d.fk_curso = c.id_curso
       INNER JOIN instituicao i ON c.fk_instituicao = i.id_instituicao
       INNER JOIN usuario u ON i.fk_usuario = u.id_usuario
       WHERE t.id_turma = ? AND u.email = ?`, [id, userEmail], (err, results) => {
            if (err) {
                console.error('Erro ao deletar turma:', err);
                return res.status(500).json({ success: false, message: 'Erro ao deletar turma' });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Turma não encontrada ou não pertence ao usuário' });
            }
            res.json({ success: true, message: 'Turma deletada com sucesso' });
        });
    }
    catch (error) {
        console.error('Erro ao deletar turma:', error);
        res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
    }
};
exports.deletarTurma = deletarTurma;
// Retorna turma pelo ID (sem validar usuário)
const buscarTurmaPorId = (req, res) => {
    const { id } = req.params;
    index_1.db.query('SELECT id_turma, nome FROM turmas WHERE id_turma = ?', [id], (err, results) => {
        if (err) {
            console.error('Erro ao buscar turma por id:', err);
            return res.status(500).json({ success: false, message: 'Erro ao buscar turma' });
        }
        const rows = results;
        if (!rows || rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Turma não encontrada' });
        }
        res.json({ success: true, data: rows[0] });
    });
};
exports.buscarTurmaPorId = buscarTurmaPorId;
