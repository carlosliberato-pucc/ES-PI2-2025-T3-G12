"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const courseController_1 = require("./courseController");
const router = express_1.default.Router();
//rotas
router.post('/', courseController_1.criarCurso);
router.get('/', courseController_1.listarCursos);
router.delete('/:id_curso', courseController_1.deletarCurso);
exports.default = router;
