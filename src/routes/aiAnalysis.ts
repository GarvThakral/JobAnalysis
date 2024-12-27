import { GoogleGenerativeAI } from "@google/generative-ai";
import { Router, Request, Response } from "express";
import { userMiddleware } from "../middleware/userMiddleware";
import multer from "multer";
import path from 'path';
import { PdfReader } from "pdfreader";

export const aiRouter = Router();
const genAI = new GoogleGenerativeAI("AIzaSyBrjNAMQdMztUGfXTDTtDEF78nSLkfvE9I");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });

const extractPdfText = (filePath: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        let text = "";

        new PdfReader().parseFileItems(filePath, (err, item) => {
            if (err) {
                console.error("Error reading PDF:", err);
                reject(err);
            } else if (!item) {
                resolve(text); // End of file
            } else if (item.text) {
                text += `${item.text} `; // Accumulate text
            }
        });
    });
};

interface customRequest extends Request {
    userId?: string;
    file?: Express.Multer.File;
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;
        cb(null, uniqueSuffix);
    }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'));
    }
};

aiRouter.post('/analyzeDescription', async (req: customRequest, res: Response) => {
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
        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();
        const cleanedResponse = responseText.replace(/```json/g, '').replace(/```/g, '');
        const json = JSON.parse(cleanedResponse);

        res.json(json);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
});

// Route to analyze resume

const extractPdfTextFromBuffer = (buffer: Buffer): Promise<string> => {
    return new Promise((resolve, reject) => {
        let text = "";
        const reader = new PdfReader();

        reader.parseBuffer(buffer, (err, item) => {
            if (err) {
                console.error("Error reading PDF:", err);
                reject(err);
            } else if (!item) {
                resolve(text); // End of file
            } else if (item.text) {
                text += `${item.text} `; // Accumulate text
            }
        });
    });
};

// Multer configuration for in-memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed"));
        }
    },
});

// Route to analyze resume
aiRouter.post("/analyzeResume", upload.single("resumeFile"), async (req: Request, res: Response) => {
    const { jobDescription } = req.body || "";

    try {
        if (!req.file || !req.file.buffer) {
            res.status(400).json({ message: "No file uploaded" });
            return;
        }

        const resumeText = await extractPdfTextFromBuffer(req.file.buffer);
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
        } else {
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
            const result = await model.generateContent(prompt);
            const responseText = await result.response.text();
            const cleanedResponse = responseText.replace(/```json/g, "").replace(/```/g, "");
            const json = JSON.parse(cleanedResponse);

            res.json(json);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error", error });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
});


aiRouter.post('/interviewPrep', async (req: customRequest, res: Response) => {
    const { jobTitle , jobDescription } = req.body;
    console.log(jobTitle,jobDescription);
    const userId = req.userId;
    const prompt = `
        {
    "job_title": "${jobTitle}",
    "job_description": "${jobDescription}",
    "task": "Generate interview preparation tips, QA pairs, and specific common mistakes based on the job description",
    "response_format": "JSON",
    "response_schema": {
        "interview_tips": "array<string>",
        "qa_pairs": "array<object>",
        "qa_pairs_structure": {
            "question": "string",
            "answer": "string"
        },
        "required_documents": "array<string>",
        "common_mistakes_to_avoid": "array<string>",
        "job_title": "string"
    },
    "instructions": {
        "common_mistakes": "Ensure the mistakes are specific to the job description and role, avoiding generic suggestions like 'Not researching the company.' Focus on actionable, role-specific feedback."
    }
}

        `;
        try {
            const result = await model.generateContent(prompt);
            const responseText = await result.response.text();
            const cleanedResponse = responseText.replace(/```json/g, "").replace(/```/g, "");
            const json = JSON.parse(cleanedResponse);

            res.json(json);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error", error });
        }

});

