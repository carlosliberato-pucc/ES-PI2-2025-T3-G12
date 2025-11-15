"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarResumoInstituicoes = exports.deletarInstituicao = exports.listarInstituicoes = exports.criarInstituicao = void 0;
const index_1 = require("../index");
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
// lista as instituições
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
// deleta a instituição
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
        // Verificar se a instituição tem cursos vinculados
        index_1.db.query(`SELECT COUNT(*) as total FROM cursos WHERE fk_instituicao = ?`, [id], (countErr, countResults) => {
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
// Lista um resumo por instituição contendo sigla, nomes dos cursos, total de disciplinas e total de turmas
const listarResumoInstituicoes = async (req, res) => {
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
        index_1.db.query(sql, [userEmail], (err, results) => {
            if (err) {
                console.error('Erro ao buscar resumo das instituições:', err);
                return res.status(500).json({ success: false, message: 'Erro ao buscar resumo' });
            }
            res.json({ success: true, data: results });
        });
    }
    catch (error) {
        console.error('Erro ao listar resumo das instituições:', error);
        res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
    }
};
exports.listarResumoInstituicoes = listarResumoInstituicoes;
