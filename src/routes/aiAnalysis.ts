import { GoogleGenerativeAI } from "@google/generative-ai";
import { Router, Request, Response } from "express";
import { userMiddleware } from "../middleware/userMiddleware";
import multer from "multer";
import path from "path";
import fs from "fs";
import { PdfReader } from "pdfreader";

export const aiRouter = Router();
const genAI = new GoogleGenerativeAI("AIzaSyBrjNAMQdMztUGfXTDTtDEF78nSLkfvE9I");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });

// Function to extract text from PDF
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

// Interface for custom request
interface customRequest extends Request {
    userId?: string;
    file?: Express.Multer.File;
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "uploads");
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;
        cb(null, uniqueSuffix);
    }
});

// Multer file filter for PDFs
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype === "application/pdf") {
        cb(null, true);
    } else {
        cb(new Error("Only PDF files are allowed"));
    }
};

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
});

// Helper function to clear the uploads directory
const clearUploadsDirectory = () => {
    const uploadPath = path.join(__dirname, "uploads");
    if (fs.existsSync(uploadPath)) {
        fs.readdirSync(uploadPath).forEach((file) => {
            const filePath = path.join(uploadPath, file);
            fs.unlinkSync(filePath);
        });
    }
};

// Route to analyze resume
aiRouter.post("/analyzeResume", upload.single("resumeFile"), async (req: customRequest, res: Response) => {
    const { jobDescription } = req.body || "";

    try {
        if (!req.file) {
            res.status(400).json({ message: "No file uploaded" });
            return;
        }

        const filePath = path.join(__dirname, "uploads", req.file.filename);
        const resumeText = await extractPdfText(filePath);
        let prompt = "";

        if (jobDescription !== "") {
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

            // Clear uploads directory after successful response
            clearUploadsDirectory();

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