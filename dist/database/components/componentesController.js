"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarComponentes = void 0;
const index_1 = require("../index");
// Lista componentes de nota de uma disciplina
const listarComponentes = async (req, res) => {
    try {
        const { id } = req.params; // id_disciplina
        index_1.db.query('SELECT id_compNota, nome, sigla, descricao FROM componentes_notas WHERE fk_disciplina = ? ORDER BY id_compNota', [id], (err, componentes) => {
            if (err) {
                console.error('Erro ao buscar componentes:', err);
                return res.status(500).json({ success: false, message: 'Erro ao buscar componentes' });
            }
            return res.json({ success: true, data: componentes });
        });
    }
    catch (error) {
        console.error('Erro em listarComponentes:', error);
        res.status(500).json({ success: false, message: 'Erro ao processar solicitação' });
    }
};
exports.listarComponentes = listarComponentes;
