"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarDisciplinas = exports.criarDisciplina = void 0;
const index_1 = require("../index");
const criarDisciplina = async (req, res) => {
    try {
        const { id_instituicao, id_curso, nome, sigla } = req.body;
        const userEmail = req.session.userEmail;
        if (!nome || !id_instituicao || !sigla || !id_curso) {
            return res.status(400).json({
                success: false,
                message: 'Preencher todos os campos é obrigatório é obrigatório'
            });
        }
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
            index_1.db.query('INSERT INTO disciplinas (nome, sigla, fk_curso) VALUES (?, ?, ?)', [nome, sigla || null, id_curso], (insertErr, insertResults) => {
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
            });
        });
    }
    catch (error) {
        console.error('Erro ao criar curso:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao processar a solicitação'
        });
    }
};
exports.criarDisciplina = criarDisciplina;
const listarDisciplinas = async (req, res) => {
    try {
        const { id_curso, id_instituicao } = req.query;
        const userEmail = req.session.userEmail;
        if (!userEmail) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado'
            });
        }
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
            index_1.db.query('SELECT id_disciplina, nome, sigla FROM disciplinas WHERE fk_curso = ? ORDER BY nome', [id_curso], (disciplinaErr, disciplina) => {
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
            });
        });
    }
    catch (error) {
        console.error('Erro ao listar disciplinas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao processar solicitação'
        });
    }
};
exports.listarDisciplinas = listarDisciplinas;
