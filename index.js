import express from "express";
import "dotenv/config"
import mongoose from "mongoose";
import userRoute from "./router/user.router.js";
import cors from "cors"
app.use(cors());
const app = express()
app.use(express.json())
app.use("/api/users",userRoute)

// app.use(cors({
//     origin:'http://localhost:5174'
// }))
const port = process.env.PORT || 2020
app.listen(port, async()=>{
    await mongoose.connect(process.env.MONGODB_CLOUD_URL)
    console.log("connected to mongodb atlas db")
    console.log(`server started at port http://localhost:${port}`)
})

