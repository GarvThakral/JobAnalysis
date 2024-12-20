import { GoogleGenerativeAI } from "@google/generative-ai";
import { Router, Request, Response } from "express";
import multer from "multer";
import { PdfReader } from "pdfreader";

export const aiRouter = Router();
const genAI = new GoogleGenerativeAI("AIzaSyBrjNAMQdMztUGfXTDTtDEF78nSLkfvE9I");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });

// Function to extract text from PDF buffer
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

export default aiRouter;
