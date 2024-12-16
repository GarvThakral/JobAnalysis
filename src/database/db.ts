import mongoose from 'mongoose';
import { Schema , Types } from 'mongoose'
import { string } from 'zod';

const userSchema = new Schema({
    username:String,
    email:String,
    password:String
})
const jobSchema = new Schema({
    userId:{type : Types.ObjectId ,ref : 'Users'},
    title:string,
    company:String,
    description:Text,
    Status:String,
    createdAt: { type:Date , default:Date.now()},
    updatedAt: { type:Date , default:Date.now()}
})
const aiAnalysisSchema = new Schema({
    jobId:{type:Types.ObjectId,ref:"Jobs"},
    summary:Text,
    keywords:{type:Array ,  default:[]},
    suggestions:{type:Array ,  default:[]}
})
const notifications = new Schema({
    
})

const userModel = mongoose.model('Users',userSchema);

export{
    userModel
}