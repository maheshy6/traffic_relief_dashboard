import User from "../model/user.model.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import "dotenv/config"
import crypto from "node:crypto"
import nodemailer from "nodemailer"
import OTP from "../model/otp.model.js";

//register new user
const signUp = async (req,res)=>{
      const {username , email, password} = req.body
      try {
        const hashedPassword = await argon2.hash(password)
        const userData = await User({
            username, email, password:hashedPassword
        })
        await userData.save()
        res.status(200).json({message:"User registered successfully"})
      } 
      catch (error) {
        console.log(error.message)
        res.status(400).json({"error":error.message})
      }
}

//logIn user
const logIn = async (req,res)=>{
      const {username , password} = req.body
      try {
        const userData = await User.findOne({username})
        const authenticated = await argon2.verify(userData.password,password)
        if(authenticated){
           const accessToken = jwt.sign({
            _id:userData._id,
            username:userData.username,
            for:"access"
           },
           process.env.JWTPASSWORD,
           {
            expiresIn:"1h"
           }
           )
           const refreshToken = jwt.sign({
            _id:userData._id,
            username:userData.username,
            for:"refresh"
           },
           process.env.JWTPASSWORD,
           {
            expiresIn:"24h"
           }
           )
           res.status(200).json({"token":accessToken, "refreshToken": refreshToken})
        }
        else{
           res.status(401).json({message:"Unauthorizd user"})
        }
      } 
      catch (error) 
      {
        console.log(error.message)
        res.status(400).json({"error":error.message})
      }
}

//setup transport
const transporter = nodemailer.createTransport({
    service:"GMAIL",
    auth:{
        user:process.env.USER_ID,
        pass:process.env.PASSWORD
    }
})

//forget password
const forgetPassword= async(req,res)=>{
    const {email} = req.body
    try {
        const otp = crypto.randomInt(100000,1000000)
        
        await transporter.sendMail({
        to:email,
        subject:"Reset password OTP",
        html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; max-width: 600px; margin: auto;
             padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h1 style="color: #333;">Reset Password OTP</h1>
            <p style="color: #555;">Dear User,</p>
            <p style="color: #555;">You requested a password reset. Use the following OTP to reset your password:</p>
            <div style="font-size: 24px; font-weight: bold; color: #4CAF50; margin: 10px 0;">
                ${otp}
            </div>
        </div>` 
    });
    await OTP.insertMany([
        {email,
        otp}
    ])
    res.status(200).json({message:"otp sent to your email address"})
    } 
    catch (error) {
        res.status(400).json({"error":error.message})
    }
}

//reset password
const resetPassword=async (req,res)=>{
    const {email,otp,newpassword}=req.body
    try {
        const entry = await OTP.findOne({email})
        if(!entry){
            return res.status(400).json({message:"Please enter correct OTP"})
        }
        if(entry.otp==otp){
            const newHash = await argon2.hash(newpassword)
            await User.updateOne(
                {email},
                {$set:{password:newHash}}
            )
            await OTP.deleteOne({email})
            res.status(200).json({message:"password reset successful"})
        }
    } 
    catch (error) {
       console.log(error.message) 
       res.status(400).json({"error":error.message})
    }
}



//Get all Users
const getUser=async(req,res)=>{
    try {
        const users = await User.find()
        res.status(200).json(users)
    } 
    catch (error) {
        console.log(error.message)
        res.status(400).json({message:"Users not found"})
    }
}
export {signUp,getUser,logIn,forgetPassword,resetPassword }