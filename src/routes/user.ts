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
        password:z.string().min(3).max(16)
    })
    try{
        const parsedBody = reqBody.parse(req.body);
        const { username , email , password } = parsedBody;
        const hashedPassword = await hash(password,5);
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }]
            }
        });
        
        if (existingUser) {
            if (existingUser.username === username && existingUser.email === email) {
                res.status(204).json({ message: 'Both username and email already exist' });
                return 
            } else if (existingUser.username === username) {
                res.status(205).json({ message: 'Username already exists' });
                return 
            } else if (existingUser.email === email) {
                res.status(206).json({ message: 'Email already exists' });
                return 
            }
        }
        
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
        res.status(203).json({
            error:e
        })
    }
})
userRouter.post('/signin',async(req,res)=>{
    const requiredBody = z.object({
        username:z.string().min(3).max(16),
        password:z.string().min(4).max(16)
    })
    try{
    const parsedBody = requiredBody.parse(req.body);
    const {username,password} = parsedBody;
    const user = await prisma.user.findFirst({
        where:{
            username
        }
    })
    console.log(user)
    if(!user || !user.password){
        res.status(204).json({
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
    }catch(e){
        res.status(203).json(e);
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