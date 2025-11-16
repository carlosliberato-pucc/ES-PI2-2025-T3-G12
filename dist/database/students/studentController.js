"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarAlunos = exports.criarAluno = void 0;
const index_1 = require("../index");
// Criar aluno
const criarAluno = (req, res) => {
    try {
        const { matricula, nome } = req.body;
        const fk_turma = Number(req.params.id); // id da turma na rota
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
// Listar alunos (de uma turma)
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
