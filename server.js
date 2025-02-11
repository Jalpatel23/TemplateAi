import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import cors from 'cors';

dotenv.config()


connectDB();


const app=express();

//middlewares
app.use(cors())
app.use(express.json())
app.use(morgan('dev'));


app.use('/api/v1/auth',authRoutes);


app.get("/",(req,res)=>{
    res.send(
        "<h1>hiii this is jal </h1>"
    )
})


const PORT=process.env.PORT;


app.listen(PORT,()=>{
    console.log(`server running on ${PORT}`);
})