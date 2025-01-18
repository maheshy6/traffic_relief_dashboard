import { Schema,model } from "mongoose";

const Otp=new Schema({
    email:String,
    otp:String
})
const OTP=model("otp",Otp)
export default OTP