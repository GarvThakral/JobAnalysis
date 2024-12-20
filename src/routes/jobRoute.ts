import { Router , Request } from 'express'
import { userMiddleware } from '../middleware/userMiddleware';
import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const jobRouter = Router();

interface customRequest extends Request{
    userId?:string
}
jobRouter.post('/create',userMiddleware,async (req:customRequest,res)=>{
    const userId = req.userId || '';
    const {title,company,description,status} = req.body;
    console.log(userId+"User id");
    try{
        
        const createdJob = await prisma.job.create({
            data:{
                userId,
                title,
                company,
                description,
                status
            }
        })
        res.json({
            createdJob
        })
    }catch(e){
        res.json({
            e
        })
    }
})
jobRouter.get('/jobs',userMiddleware, async (req:customRequest, res) => {
    try {
        const userId = req.userId;  // or req.body.userId if you're passing it in the body
        console.log('User ID:', userId);

        const jobs = await prisma.job.findMany({
            where: { userId },
        });

        res.json({ jobs });
    } catch (e) {
        console.error('Error:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});
jobRouter.get('/:id',userMiddleware,async (req:customRequest,res)=>{
    const jobId = req.params.id;
    const userId = req.userId;
    try{
        const job = await prisma.job.findFirst({
            where:{
                id:jobId,
                userId
            }
        })
        res.json({
            job
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
    const jobId = req.params.id;
    const userId = req.userId
    try{
        const deletedJob = await prisma.job.delete({
            where:{
                id:jobId,
                userId
            }
        })
        res.json({
            message:"Deleted job",
            deletedJob
        })
    }catch( e ){
        res.json({
            e
        })
    }
})

