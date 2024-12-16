import { Router , Request } from 'express'
import { userMiddleware } from '../middleware/userMiddleware';
import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const jobRouter = Router();

interface customRequest extends Request{
    userId?:string
}

jobRouter.post('/create',userMiddleware,async (req:customRequest,res)=>{
    const userId = req.userId || '';
    const {title,company,description,status} = req.body;
    try{
        const createdJob = prisma.job.create({
            data:{
                userId,
                title,
                company,
                description,
                status
            }
        })
        console.log(createdJob)
    }catch(e){
        res.json({
            e
        })
    }
})
jobRouter.get('/:id',userMiddleware,async (req:customRequest,res)=>{
    const jobId = req.params.id;
    const userId = req.userId;
    try{
        const job = prisma.job.findFirst({
            where:{
                id:jobId,
                userId
            }
        })
        console.log(job);
    }catch( e ){
        res.json({
            e
        })
    }
})
jobRouter.get('/user/:userid',userMiddleware,async (req:customRequest,res)=>{
    const userId = req.params.userid;
    try{
        const jobs = prisma.job.findMany({
            where:{
                userId
            }
        })
    }catch( e ){
        res.json({
            e
        })
    } 
})
jobRouter.put('/:id',userMiddleware,async (req:customRequest,res)=>{
    const jobid = req.params.id;
    
})
jobRouter.delete('/:id',userMiddleware,async (req:customRequest,res)=>{
    const jobid = req.params.id;
    
})
