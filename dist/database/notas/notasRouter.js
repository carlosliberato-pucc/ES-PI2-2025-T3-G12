"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notasController_1 = require("./notasController");
const router = express_1.default.Router();
router.post('/', notasController_1.salvarNota); // POST /api/notas
router.get('/turma/:idTurma', notasController_1.listarNotasTurma); // GET /api/notas/turma/:idTurma
exports.default = router;
