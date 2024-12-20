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
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobRouter = void 0;
const express_1 = require("express");
const userMiddleware_1 = require("../middleware/userMiddleware");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.jobRouter = (0, express_1.Router)();
exports.jobRouter.post('/create', userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId || '';
    const { title, company, description, status } = req.body;
    console.log(userId + "User id");
    try {
        const createdJob = yield prisma.job.create({
            data: {
                userId,
                title,
                company,
                description,
                status
            }
        });
        res.json({
            createdJob
        });
    }
    catch (e) {
        res.json({
            e
        });
    }
}));
exports.jobRouter.get('/jobs', userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId; // or req.body.userId if you're passing it in the body
        console.log('User ID:', userId);
        const jobs = yield prisma.job.findMany({
            where: { userId },
        });
        res.json({ jobs });
    }
    catch (e) {
        console.error('Error:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.jobRouter.get('/:id', userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const jobId = req.params.id;
    const userId = req.userId;
    try {
        const job = yield prisma.job.findFirst({
            where: {
                id: jobId,
                userId
            }
        });
        res.json({
            job
        });
    }
    catch (e) {
        res.json({
            e
        });
    }
}));
exports.jobRouter.put('/:id', userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const jobid = req.params.id;
}));
exports.jobRouter.delete('/:id', userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const jobId = req.params.id;
    const userId = req.userId;
    try {
        const deletedJob = yield prisma.job.delete({
            where: {
                id: jobId,
                userId
            }
        });
        res.json({
            message: "Deleted job",
            deletedJob
        });
    }
    catch (e) {
        res.json({
            e
        });
    }
}));
