"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarNotasFinais = exports.salvarNotaFinal = void 0;
const index_1 = require("../index");
const salvarNotaFinal = async (req, res) => {
    console.log('Chegou salvarNotaFinal!', req.body);
    try {
        const { matricula, turma, valor } = req.body;
        const nf = Number(valor);
        if (!matricula || !turma || valor == null || isNaN(nf) || nf < 0 || nf > 10) {
            return res.status(400).json({ success: false, message: 'Dados inválidos!' });
        }
        index_1.db.query(`INSERT INTO nota_final (valor, fk_matricula, fk_turma) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE valor = VALUES(valor)`, [nf, matricula, turma], (err) => {
            if (err) {
                console.error('Erro ao salvar nota final:', err);
                return res.status(500).json({ success: false, message: 'Erro ao salvar nota final' });
            }
            res.json({ success: true, message: 'Nota final salva!' });
        });
    }
    catch (e) {
        console.error('Falha ao salvar nota final:', e);
        res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
};
exports.salvarNotaFinal = salvarNotaFinal;
// Adicione essa função ao notaFinalController.ts
const buscarNotasFinais = async (req, res) => {
    try {
        const { turma } = req.params;
        if (!turma) {
            return res.status(400).json({ success: false, message: 'ID da turma não fornecido!' });
        }
        index_1.db.query(`SELECT nf.valor, nf.fk_matricula as matricula, nf.fk_turma as turma
       FROM nota_final nf
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
