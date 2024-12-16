"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
const zod_1 = require("zod");
const userSchema = new mongoose_2.Schema({
    username: String,
    email: String,
    password: String
});
const jobSchema = new mongoose_2.Schema({
    userId: { type: mongoose_2.Types.ObjectId, ref: 'Users' },
    title: zod_1.string,
    company: String,
    description: Text,
    Status: String,
    createdAt: { type: Date, default: Date.now() },
    updatedAt: { type: Date, default: Date.now() }
});
const aiAnalysisSchema = new mongoose_2.Schema({
    jobId: { type: mongoose_2.Types.ObjectId, ref: "Jobs" },
    summary: Text,
    keywords: { type: Array, default: [] },
    suggestions: { type: Array, default: [] }
});
const notifications = new mongoose_2.Schema({});
const userModel = mongoose_1.default.model('Users', userSchema);
exports.userModel = userModel;
