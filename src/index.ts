// import { GoogleGenerativeAI } from "@google/generative-ai"

// const genAI = new GoogleGenerativeAI("AIzaSyCeVgKDaDRaI7Ss4qIqW9q-o71oW8zezJE");
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });

// const prompt = "Explain how AI works";

// async function main(){
//     const result = await model.generateContent(prompt);
//     console.log(result.response.text());
// }
// main()
import express from 'express'
import mongoose from 'mongoose'
import { userRouter } from './routes/user';

const app = express();
app.use(express.json());
app.use("/user",userRouter);

app.get("/",(req,res)=>{
    res.json({
        message:"The app seems to be working"
    });
    
})

async function main(){
    await mongoose.connect("mongodb://localhost:27017/jobapplication");
    console.log("Connected to the mongoDB database");
    app.listen(3000,()=>{
        console.log("Listening on port 3000");
    })
}
main();

