import express from 'express'
import { userRouter } from './src/routes/user';
import { jobRouter } from './src/routes/jobRoute';
import { aiRouter } from './src/routes/aiAnalysis';
import { PrismaClient } from '@prisma/client';
import cors from 'cors'

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());
app.use("/ai",aiRouter);
app.use('/job',jobRouter);
app.use("/user",userRouter);

app.get("/",(req,res)=>{
    res.json({
        message:"The app seems to be working"
    });
    
})

async function main(){
    app.listen(3000,()=>{
        console.log("Listening on port 3000");
    })
}
main();
