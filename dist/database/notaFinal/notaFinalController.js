"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.salvarNotaFinal = void 0;
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
