"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarNotasFinais = exports.salvarNotaFinal = void 0;
const index_1 = require("../index");
// Salvar (inserir/atualizar) nota final de um aluno em uma turma
const salvarNotaFinal = async (req, res) => {
    console.log('Chegou salvarNotaFinal!', req.body);
    try {
        const { matricula, turma, valor } = req.body;
        const nf = Number(valor);
        if (!matricula || !turma || valor == null || isNaN(nf) || nf < 0 || nf > 10) {
            return res.status(400).json({ success: false, message: 'Dados inválidos!' });
        }
        // 1) Buscar id do aluno pela matrícula
        index_1.db.query('SELECT id FROM alunos WHERE matricula = ? LIMIT 1', [matricula], (err, rows) => {
            if (err) {
                console.error('Erro ao buscar aluno pela matrícula:', err);
                return res.status(500).json({ success: false, message: 'Erro ao buscar aluno' });
            }
            if (!rows || rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Aluno não encontrado para esta matrícula' });
            }
            const idAluno = rows[0].id;
            // 2) Inserir/atualizar nota final usando fk_id_aluno
            index_1.db.query(`INSERT INTO nota_final (valor, fk_id_aluno, fk_turma)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE valor = VALUES(valor)`, [nf, idAluno, turma], (err2) => {
                if (err2) {
                    console.error('Erro ao salvar nota final:', err2);
                    return res.status(500).json({ success: false, message: 'Erro ao salvar nota final' });
                }
                res.json({ success: true, message: 'Nota final salva!' });
            });
        });
    }
    catch (e) {
        console.error('Falha ao salvar nota final:', e);
        res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
};
exports.salvarNotaFinal = salvarNotaFinal;
// Buscar notas finais de uma turma
const buscarNotasFinais = async (req, res) => {
    try {
        const { turma } = req.params;
        if (!turma) {
            return res.status(400).json({ success: false, message: 'ID da turma não fornecido!' });
        }
        // Agora buscamos por fk_turma e juntamos com alunos para pegar a matrícula
        index_1.db.query(`SELECT nf.valor,
              a.matricula AS matricula,
              nf.fk_turma AS turma
         FROM nota_final nf
         JOIN alunos a ON a.id = nf.fk_id_aluno
        WHERE nf.fk_turma = ?`, [turma], (err, results) => {
            if (err) {
                console.error('Erro ao buscar notas finais:', err);
                return res.status(500).json({ success: false, message: 'Erro ao buscar notas finais' });
            }
            res.json({ success: true, data: results });
        });
    }
    catch (e) {
        console.error('Falha ao buscar notas finais:', e);
        res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
};
exports.buscarNotasFinais = buscarNotasFinais;
