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
exports.aiRouter = void 0;
const generative_ai_1 = require("@google/generative-ai");
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const pdfreader_1 = require("pdfreader");
exports.aiRouter = (0, express_1.Router)();
const genAI = new generative_ai_1.GoogleGenerativeAI("AIzaSyBrjNAMQdMztUGfXTDTtDEF78nSLkfvE9I");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });
const extractPdfText = (filePath) => {
    return new Promise((resolve, reject) => {
        let text = "";
        new pdfreader_1.PdfReader().parseFileItems(filePath, (err, item) => {
            if (err) {
                console.error("Error reading PDF:", err);
                reject(err);
            }
            else if (!item) {
                resolve(text); // End of file
            }
            else if (item.text) {
                text += `${item.text} `; // Accumulate text
            }
        });
    });
};
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path_1.default.join(__dirname, 'uploads');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;
        cb(null, uniqueSuffix);
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    }
    else {
        cb(new Error('Only PDF files are allowed'));
    }
};
exports.aiRouter.post('/analyzeDescription', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { description } = req.body;
    const prompt = `{
        "input": {
            "job_description": "${description}"
        },
        "task": "Analyze",
        "response_format": "JSON",
        "response_schema": {
            "job_title": "string",
            "description_analysis": "string",
            "required_skills": "array<string>",
            "desired_skills": "array<string>",
            "experience_level": "string"
        }
    }`;
    try {
        const result = yield model.generateContent(prompt);
        const responseText = yield result.response.text();
        const cleanedResponse = responseText.replace(/```json/g, '').replace(/```/g, '');
        const json = JSON.parse(cleanedResponse);
        res.json(json);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
}));
// Route to analyze resume
const extractPdfTextFromBuffer = (buffer) => {
    return new Promise((resolve, reject) => {
        let text = "";
        const reader = new pdfreader_1.PdfReader();
        reader.parseBuffer(buffer, (err, item) => {
            if (err) {
                console.error("Error reading PDF:", err);
                reject(err);
            }
            else if (!item) {
                resolve(text); // End of file
            }
            else if (item.text) {
                text += `${item.text} `; // Accumulate text
            }
        });
    });
};
// Multer configuration for in-memory storage
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        }
        else {
            cb(new Error("Only PDF files are allowed"));
        }
    },
});
// Route to analyze resume
exports.aiRouter.post("/analyzeResume", upload.single("resumeFile"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { jobDescription } = req.body || "";
    try {
        if (!req.file || !req.file.buffer) {
            res.status(400).json({ message: "No file uploaded" });
            return;
        }
        const resumeText = yield extractPdfTextFromBuffer(req.file.buffer);
        let prompt = "";
        if (jobDescription) {
            prompt = `{
                "input": {
                    "resume": "${resumeText}",
                    "job_description": "${jobDescription}"
                },
                "task": "Analyze Resume",
                "response_format": "JSON",
                "response_schema": {
                    "missing_keywords": "array<string>",
                    "detailed_analysis": "string",
                    "required_skills": "array<string>",
                    "desired_skills": "array<string>"
                }
            }`;
        }
        else {
            prompt = `{
                "input": {
                    "resume": "${resumeText}"
                },
                "task": "Analyze Resume",
                "response_format": "JSON",
                "response_schema": {
                    "missing_keywords": "array<string>",
                    "detailed_analysis": "string"
                }
            }`;
        }
        try {
            const result = yield model.generateContent(prompt);
            const responseText = yield result.response.text();
            const cleanedResponse = responseText.replace(/```json/g, "").replace(/```/g, "");
            const json = JSON.parse(cleanedResponse);
            res.json(json);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error", error });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
}));
exports.aiRouter.post('/interviewPrep', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { jobTitle, jobDescription } = req.body;
    console.log(jobTitle, jobDescription);
    const userId = req.userId;
    const prompt = `{
        "job_title": "${jobTitle}",
        "job_description": "${jobDescription}",
        "task": "Generate interview preparation tips based on the job description"
    }`;
    try {
        const result = yield model.generateContent(prompt);
        res.json({
            result
        });
    }
    catch (e) {
        res.json({
            e
        });
    }
}));
