"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMiddleware = userMiddleware;
const jsonwebtoken_1 = require("jsonwebtoken");
const userSecret = "s3cret";
function userMiddleware(req, res, next) {
    const token = req.headers.token;
    console.log(req.headers);
    if (!token) {
        res.status(401).json({ error: "Token is required" });
        return;
    }
    try {
        const decoded = (0, jsonwebtoken_1.verify)(token, userSecret);
        req.userId = decoded.userId;
        next();
    }
    catch (err) {
        return;
    }
}
