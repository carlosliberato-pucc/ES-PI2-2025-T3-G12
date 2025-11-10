"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Desenvolvido por Carlos Liberato
const mysql2_1 = __importDefault(require("mysql2"));
const dotenv = __importStar(require("dotenv"));
// Garante que o arquivo .env (onde estão HOST, USER e PASSWORD) seja lido e
// suas variáveis injetadas em process.env antes de qualquer conexão.
dotenv.config();
const dbConfig = {
    // Tenta usar a variável DB_HOST do .env; se não existir, usa 'localhost'.
    host: process.env.DB_HOST || 'localhost',
    // Tenta usar a variável DB_USER do .env; se não existir, usa 'root'.
    user: process.env.DB_USER || 'root',
    // Tenta usar a variável DB_PASSWORD do .env; se não existir, usa uma string vazia.
    password: process.env.DB_PASSWORD || '',
    // Tenta usar a variável DB_NAME do .env; se não existir, usa 'notadez'.
    database: process.env.DB_NAME || 'notadez',
};
// Cria um pool de conexões (mais resiliente que single connection)
const pool = mysql2_1.default.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: 0,
    namedPlaceholders: false
});
// Log simples para desenvolvimento
if (process.env.NODE_ENV !== 'production') {
    console.log('MySQL pool criado (connectionLimit:', (process.env.DB_CONNECTION_LIMIT || 10) + ')');
}
exports.default = pool;
