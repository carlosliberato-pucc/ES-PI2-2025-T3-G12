"use strict";
// Desenvolvido por Carlos Liberato
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
// Importa o objeto de conexão com o MySQL que foi criado e configurado 
// no arquivo './connection.ts' (onde estão as credenciais e o connection.connect).
const connection_1 = __importDefault(require("./connection"));
exports.db = connection_1.default;
