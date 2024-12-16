"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMiddleware = userMiddleware;
const jsonwebtoken_1 = require("jsonwebtoken");
const userSecret = "s3cret";
function userMiddleware(req, res, next) {
    const token = req.headers.token;
    if (!token) {
        return;
    }
    try {
        const decoded = (0, jsonwebtoken_1.verify)(token, userSecret);
        req.userId = decoded._id;
        next();
    }
    catch (err) {
        return;
    }
}
