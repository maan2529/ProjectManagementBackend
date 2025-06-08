import express,{ NextFunction} from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import connectDB from './config/connectdb';

import httpStatus from 'http-status';

import userRoutes from './routes/userRoutes'
 
dotenv.config();


const app = express();
const PORT= process.env.PORT || 8001;

connectDB();

app.use(express.json());
app.use(cors());



app.use('/api/user', userRoutes);


app.listen(PORT,()=>{
    console.log(`Server Runnig on Port ${PORT}`);
})


