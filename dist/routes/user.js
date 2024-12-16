"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const bcrypt_1 = require("bcrypt");
const db_1 = require("../database/db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userMiddleware_1 = require("../middleware/userMiddleware");
const userSecret = "s3cret";
const userRouter = (0, express_1.Router)();
exports.userRouter = userRouter;
userRouter.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reqBody = zod_1.z.object({
        username: zod_1.z.string().min(3).max(8),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(4).max(10)
    });
    const parsedBody = reqBody.parse(req.body);
    const { username, email, password } = parsedBody;
    const hashedPassword = yield (0, bcrypt_1.hash)(password, 5);
    try {
        const user = db_1.userModel.create({
            username,
            email,
            password: hashedPassword
        });
        res.json({
            user
        });
    }
    catch (e) {
        res.json({
            error: e
        });
    }
}));
userRouter.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requiredBody = zod_1.z.object({
        username: zod_1.z.string().min(3).max(8),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(4).max(10)
    });
    const parsedBody = requiredBody.parse(req.body);
    const { username, password } = parsedBody;
    const user = yield db_1.userModel.findOne({
        username
    });
    console.log(user);
    if (!user || !user.password) {
        res.json({
            message: "The user does not exist"
        });
        return;
    }
    else {
        const userPassword = user.password;
        const checkedPassword = yield (0, bcrypt_1.compare)(password, userPassword);
        if (checkedPassword) {
            const userId = user._id;
            const token = jsonwebtoken_1.default.sign({ userId }, userSecret);
            res.json({
                userId,
                token
            });
        }
        else {
            res.json({
                message: "Incorrect password"
            });
        }
    }
}));
userRouter.get('/:id', userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.params.id;
    try {
        const userDetails = yield db_1.userModel.findOne({
            user
        });
        res.json({
            user
        });
    }
    catch (e) {
    }
}));
