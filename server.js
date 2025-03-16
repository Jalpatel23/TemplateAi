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


app.post("/api/chats", (req, res) => { 
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: "Text is required" });
    }
    console.log(text);
    res.status(200).json({ message: `Received: ${text}` });
});


const PORT=process.env.PORT;


app.listen(PORT,()=>{
    console.log(`server running on ${PORT}`);
})