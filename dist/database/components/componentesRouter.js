"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const componentesController_1 = require("./componentesController");
const router = express_1.default.Router();
// lista os componentes
router.get('/:id', componentesController_1.listarComponentes); // id da disciplina
exports.default = router;
