import { Router } from "express";
import { userMiddleware } from "../middleware/userMiddleware";
import { Request, Response } from "express";
const aiRouter = Router();

interface customRequest extends Request{
    userId?:string
}

aiRouter.post('/analyzeDescription',userMiddleware,async (req:customRequest,res:Response)=>{
    const { description } = req.body;
    const userId = req.userId;
});
aiRouter.post('/analyzeResume',userMiddleware,async (req:customRequest,res)=>{
    const { resumeFile , description } = req.body;
    const userId = req.userId;
})
aiRouter.post('/interviewPrep',userMiddleware,async (req:customRequest,res)=>{
const { jobTitle } = req.body;
const userId = req.userId;
})
