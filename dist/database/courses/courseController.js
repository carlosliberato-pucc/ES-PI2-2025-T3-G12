"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletarCurso = exports.listarCursos = exports.criarCurso = void 0;
const index_1 = require("../index");
// Cria um curso vinculado a uma instituição do usuário
const criarCurso = async (req, res) => {
    try {
        const { id_instituicao, nome, periodo } = req.body;
        const userEmail = req.session.userEmail;
        if (!nome) {
            return res.status(400).json({ success: false, message: 'Nome do curso é obrigatório' });
        }
        // Confirma se instituição está vinculada ao usuário
        index_1.db.query(`SELECT i.id_instituicao FROM instituicao i INNER JOIN usuario u ON i.fk_usuario = u.id_usuario WHERE i.id_instituicao = ? AND u.email = ?`, [id_instituicao, userEmail], (err, results) => {
            if (err) {
                console.error('Erro ao verificar instituição:', err);
                return res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
            }
            if (!Array.isArray(results) || results.length === 0) {
                return res.status(403).json({ success: false, message: 'Instituição não encontrada ou não pertence ao usuário' });
            }
            // Insere curso
            index_1.db.query('INSERT INTO cursos (nome, periodo, fk_instituicao) VALUES (?, ?, ?)', [nome, periodo || null, id_instituicao], (insertErr, insertResults) => {
                if (insertErr) {
                    console.error('Erro ao criar curso:', insertErr);
                    return res.status(500).json({ success: false, message: 'Erro ao criar curso' });
                }
                const cursoId = insertResults.insertId;
                res.status(201).json({
                    success: true,
                    message: 'Curso criado com sucesso',
                    data: { id_curso: cursoId, nome, periodo, fk_instituicao: id_instituicao }
                });
            });
        });
    }
    catch (error) {
        console.error('Erro ao criar curso:', error);
        res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
    }
};
exports.criarCurso = criarCurso;
// Lista cursos de uma instituição do usuário
const listarCursos = async (req, res) => {
    try {
        const { id_instituicao } = req.query;
        const userEmail = req.session.userEmail;
        if (!userEmail) {
            return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        }
        if (!id_instituicao) {
            return res.status(400).json({ success: false, message: 'ID da instituição é obrigatório' });
        }
        // Confirma vínculo
        index_1.db.query(`SELECT i.id_instituicao FROM instituicao i INNER JOIN usuario u ON i.fk_usuario = u.id_usuario WHERE i.id_instituicao = ? AND u.email = ?`, [id_instituicao, userEmail], (err, results) => {
            if (err) {
                console.error('Erro ao verificar instituição:', err);
                return res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
            }
            if (!Array.isArray(results) || results.length === 0) {
                return res.status(403).json({ success: false, message: 'Instituição não encontrada ou não pertence ao usuário' });
            }
            // Lista cursos
            index_1.db.query('SELECT id_curso, nome, periodo FROM cursos WHERE fk_instituicao = ? ORDER BY nome', [id_instituicao], (cursosErr, cursos) => {
                if (cursosErr) {
                    console.error('Erro ao buscar cursos:', cursosErr);
                    return res.status(500).json({ success: false, message: 'Erro ao buscar cursos' });
                }
                res.json({ success: true, data: cursos });
            });
        });
    }
    catch (error) {
        console.error('Erro ao listar cursos:', error);
        res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
    }
};
exports.listarCursos = listarCursos;
// Deleta curso se for do usuário e não tiver disciplinas
const deletarCurso = async (req, res) => {
    try {
        const { id_curso } = req.params;
        const userEmail = req.session.userEmail;
        if (!userEmail) {
            return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        }
        // Checa se o curso tem disciplinas vinculadas
        index_1.db.query(`SELECT COUNT(*) as total FROM disciplinas WHERE fk_curso = ?`, [id_curso], (countErr, countResults) => {
            if (countErr) {
                console.error('Erro ao verificar disciplinas:', countErr);
                return res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
            }
            const totalDisciplinas = countResults[0].total;
            if (totalDisciplinas > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Não é possível deletar este curso. Existem ${totalDisciplinas} disciplina(s) vinculada(s). Exclua as disciplinas primeiro.`
                });
            }
            // Deleta curso se for do usuário
            index_1.db.query(`DELETE c FROM cursos c
           INNER JOIN instituicao i ON c.fk_instituicao = i.id_instituicao
           INNER JOIN usuario u ON i.fk_usuario = u.id_usuario
           WHERE c.id_curso = ? AND u.email = ?`, [id_curso, userEmail], (err, results) => {
                if (err) {
                    console.error('Erro ao deletar curso:', err);
                    return res.status(500).json({ success: false, message: 'Erro ao deletar curso' });
                }
                if (results.affectedRows === 0) {
                    return res.status(404).json({ success: false, message: 'Curso não encontrado ou não pertence ao usuário' });
                }
                res.json({ success: true, message: 'Curso deletado com sucesso' });
            });
        });
    }
    catch (error) {
        console.error('Erro ao deletar curso:', error);
        res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
    }
};
exports.deletarCurso = deletarCurso;
