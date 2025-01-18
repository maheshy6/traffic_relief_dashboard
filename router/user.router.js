import { Router } from "express";
import { forgetPassword, getUser, resetPassword, signUp } from "../controller/user.controller.js";

const userRoute = Router()

userRoute.post("/",signUp)
userRoute.post("/forgetpassword",forgetPassword)
userRoute.post("/resetpassword",resetPassword)
userRoute.get("/",getUser)

export default userRoute