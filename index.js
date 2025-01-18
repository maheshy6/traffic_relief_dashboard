import express from "express";
import "dotenv/config"
import mongoose from "mongoose";
import userRoute from "./router/user.router.js";

const app = express()
app.use(express.json())
app.use("/api/users",userRoute)
const port = process.env.port || 2020
app.listen(port, async()=>{
    await mongoose.connect(process.env.MONGODB_CLOUD_URL)
    console.log("connected to mongodb atlas")
    console.log(`server started at port http://localhost:${port}`)
})

