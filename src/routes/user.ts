import { Router } from "express";
import { z } from "zod";
import { hash , compare } from "bcrypt"
import Jwt from "jsonwebtoken";
import { userMiddleware } from "../middleware/userMiddleware";
import { PrismaClient } from "@prisma/client";
const userSecret = process.env.JWT_USER || "";
const userRouter = Router();
const prisma = new PrismaClient();


userRouter.post('/signup',async (req,res)=>{
    const reqBody = z.object({
        username:z.string().min(3).max(16),
        email:z.string().email()    ,
        password:z.string().min(4).max(16)
    })
    const parsedBody = reqBody.parse(req.body);
    const { username , email , password } = parsedBody;
    const hashedPassword = await hash(password,5);
    try{
        const user = await prisma.user.create({
            data:{
                username,
                email,
                password:hashedPassword
            }
        })
        res.json({
            user
        })
    }catch(e){
        res.json({
            error:e
        })
    }
})
userRouter.post('/signin',async(req,res)=>{
    const requiredBody = z.object({
        username:z.string().min(3).max(16),
        password:z.string().min(4).max(16)
    })
    const parsedBody = requiredBody.parse(req.body);
    const {username,password} = parsedBody;
    const user = await prisma.user.findFirst({
        where:{
            username
        }
    })
    console.log(user)
    if(!user || !user.password){
        res.json({
            message:"The user does not exist"
        });
        return;
    }else{
        const userPassword = user.password;
        const checkedPassword = await compare(password,userPassword);
        if(checkedPassword){
            const userId = user.id;
            const token = Jwt.sign({userId},userSecret);
            res.json({
                userId,
                token
            })
        }else{
            res.json({
                message:"Incorrect password"
            })
        }
    }
})
userRouter.get('/:id',userMiddleware ,async (req:any,res)=>{
    const userId = req.params.id;
    try{
        const userDetails = await prisma.user.findFirst({
            where:{
                id:userId
            }
        })
        res.json({
            userDetails
        });
    }catch( e ){
    }
})
export{
    userRouter
}