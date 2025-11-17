"use strict";
// Desenvolvido por Carlos Liberato (Criar, Listar, Editar e Deletar Alunos)
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletarAluno = exports.editarAluno = exports.listarAlunos = exports.criarAluno = void 0;
const index_1 = require("../index");
// Criar aluno
const criarAluno = (req, res) => {
    try {
        const { matricula, nome } = req.body;
        const fk_turma = Number(req.params.id);
        if (!matricula || !nome) {
            return res.status(400).json({
                success: false,
                message: 'Preencher todos os campos é obrigatório'
            });
        }
        index_1.db.query('INSERT INTO alunos (matricula, nome, fk_turma) VALUES (?, ?, ?)', [matricula, nome, fk_turma], (err, result) => {
            if (err) {
                console.error('Erro ao criar aluno:', err);
                return res.status(500).json({ success: false, message: 'Erro ao criar aluno' });
            }
            res.status(201).json({ success: true, message: 'Aluno criado com sucesso' });
        });
    }
    catch (error) {
        console.error('Erro ao criar aluno:', error);
        res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
    }
};
exports.criarAluno = criarAluno;
// Listar alunos de uma turma
const listarAlunos = (req, res) => {
    try {
        const fk_turma = Number(req.params.id);
        index_1.db.query('SELECT matricula, nome FROM alunos WHERE fk_turma = ? ORDER BY nome', [fk_turma], (err, alunos) => {
            if (err) {
                console.error('Erro ao buscar alunos:', err);
                return res.status(500).json({ success: false, message: 'Erro ao buscar alunos' });
            }
            res.json({ success: true, data: alunos });
        });
    }
    catch (error) {
        console.error('Erro ao listar alunos:', error);
        res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
    }
};
exports.listarAlunos = listarAlunos;
// Editar aluno na turma
const editarAluno = (req, res) => {
    try {
        const fk_turma = Number(req.params.id);
        const matricula = req.params.matricula;
        const { novaMatricula, novoNome } = req.body;
        if (!novaMatricula && !novoNome) {
            return res.status(400).json({
                success: false,
                message: 'Nenhum dado para atualizar'
            });
        }
        // Monta dinamicamente
        const campos = [];
        const valores = [];
        if (novaMatricula) {
            campos.push('matricula = ?');
            valores.push(novaMatricula);
        }
        if (novoNome) {
            campos.push('nome = ?');
            valores.push(novoNome);
        }
        valores.push(matricula, fk_turma);
        const sql = `UPDATE alunos SET ${campos.join(', ')} WHERE matricula = ? AND fk_turma = ?`;
        index_1.db.query(sql, valores, (err, result) => {
            if (err) {
                console.error('Erro ao editar aluno:', err);
                return res.status(500).json({ success: false, message: 'Erro ao editar aluno' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Aluno não encontrado nessa turma' });
            }
            return res.json({ success: true, message: 'Aluno atualizado com sucesso' });
        });
    }
    catch (error) {
        console.error('Erro ao editar aluno:', error);
        res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
    }
};
exports.editarAluno = editarAluno;
// Excluir aluno na turma
const deletarAluno = (req, res) => {
    try {
        const fk_turma = Number(req.params.id);
        const matricula = req.params.matricula;
        const { nome } = req.body;
        index_1.db.query('DELETE FROM alunos WHERE matricula = ? AND nome = ? AND fk_turma = ?', [matricula, nome, fk_turma], (err, result) => {
            if (err) {
                console.error('Erro ao deletar aluno:', err);
                return res.status(500).json({ success: false, message: 'Erro ao deletar aluno' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Aluno não encontrado nessa turma' });
            }
            return res.json({ success: true, message: 'Aluno deletado com sucesso' });
        });
    }
    catch (error) {
        console.error('Erro ao deletar aluno:', error);
        res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
    }
};
exports.deletarAluno = deletarAluno;
