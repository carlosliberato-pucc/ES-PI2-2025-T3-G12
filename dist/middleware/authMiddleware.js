"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const authMiddleware = (req, res, next) => {
    if (req.session.user) {
        next();
    }
    else {
        res.status(401).send('Você precisa estar logado');
    }
};
exports.authMiddleware = authMiddleware;
