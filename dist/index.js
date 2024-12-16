"use strict";
// // import { GoogleGenerativeAI } from "@google/generative-ai"
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// // const genAI = new GoogleGenerativeAI("AIzaSyCeVgKDaDRaI7Ss4qIqW9q-o71oW8zezJE");
// // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });
// // const prompt = "Explain how AI works";
// // async function main(){
// //     const result = await model.generateContent(prompt);
// //     console.log(result.response.text());
// // }
// // main()
// import express from 'express'
// import mongoose from 'mongoose'
// import { userRouter } from './routes/user';
// const app = express();
// app.use(express.json());
// app.use("/user",userRouter);
// app.get("/",(req,res)=>{
//     res.json({
//         message:"The app seems to be working"
//     });
// })
// async function main(){
//     await mongoose.connect("mongodb://localhost:27017/jobapplication");
//     console.log("Connected to the mongoDB database");
//     app.listen(3000,()=>{
//         console.log("Listening on port 3000");
//     })
// }
// main();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield prisma.user.findMany();
        console.log(users);
    });
}
main()
    .catch(e => {
    throw e;
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
