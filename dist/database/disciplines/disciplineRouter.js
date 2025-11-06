"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const disciplineController_1 = require("./disciplineController");
const router = express_1.default.Router();
router.post('/', disciplineController_1.criarDisciplina);
router.get('/', disciplineController_1.listarDisciplinas);
exports.default = router;
