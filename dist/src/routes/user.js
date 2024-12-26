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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userMiddleware_1 = require("../middleware/userMiddleware");
const client_1 = require("@prisma/client");
const userSecret = process.env.JWT_USER || "";
const userRouter = (0, express_1.Router)();
exports.userRouter = userRouter;
const prisma = new client_1.PrismaClient();
userRouter.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reqBody = zod_1.z.object({
        username: zod_1.z.string().min(3).max(16),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(3).max(16)
    });
    try {
        const parsedBody = reqBody.parse(req.body);
        const { username, email, password } = parsedBody;
        const hashedPassword = yield (0, bcrypt_1.hash)(password, 5);
        const existingUser = yield prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }]
            }
        });
        if (existingUser) {
            if (existingUser.username === username && existingUser.email === email) {
                res.status(204).json({ message: 'Both username and email already exist' });
                return;
            }
            else if (existingUser.username === username) {
                res.status(205).json({ message: 'Username already exists' });
                return;
            }
            else if (existingUser.email === email) {
                res.status(206).json({ message: 'Email already exists' });
                return;
            }
        }
        const user = yield prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            }
        });
        res.json({
            user
        });
    }
    catch (e) {
        res.status(203).json({
            error: e
        });
    }
}));
userRouter.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requiredBody = zod_1.z.object({
        username: zod_1.z.string().min(3).max(16),
        password: zod_1.z.string().min(4).max(16)
    });
    try {
        const parsedBody = requiredBody.parse(req.body);
        const { username, password } = parsedBody;
        const user = yield prisma.user.findFirst({
            where: {
                username
            }
        });
        console.log(user);
        if (!user || !user.password) {
            res.status(204).json({
                message: "The user does not exist"
            });
            return;
        }
        else {
            const userPassword = user.password;
            const checkedPassword = yield (0, bcrypt_1.compare)(password, userPassword);
            if (checkedPassword) {
                const userId = user.id;
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
    }
    catch (e) {
        res.status(203).json(e);
    }
}));
userRouter.get('/:id', userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    try {
        const userDetails = yield prisma.user.findFirst({
            where: {
                id: userId
            }
        });
        res.json({
            userDetails
        });
    }
    catch (e) {
    }
}));
