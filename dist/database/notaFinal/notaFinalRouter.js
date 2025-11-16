"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notaFinalController_1 = require("./notaFinalController");
const router = express_1.default.Router();
router.post('/', notaFinalController_1.salvarNotaFinal);
exports.default = router;
