"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const classController_1 = require("./classController");
const router = express_1.default.Router();
router.post('/', classController_1.criarTurma);
router.get('/', classController_1.listarTurmas);
router.get('/:id', classController_1.buscarTurmaPorId); // ANTES do DELETE
router.delete('/:id', classController_1.deletarTurma);
exports.default = router;
