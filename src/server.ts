import express, { Application, Response, Request, NextFunction, ErrorRequestHandler, RequestHandler } from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/connectdb";
import httpStatus from "http-status";
import userRoutes from "./routes/userRoutes";
import studentRoutes from "./routes/studentRoutes";
import guideRoute from "./routes/guideRoutes";
import projectGroupRoutes from "./routes/projectGroupRoute";
import { object } from "joi";
import http from "http";
import { initializeSocket } from "./socket";
import session from 'express-session';
import meetRoutes from './routes/meet.route';

import projectRoutes from './routes/projectRoutes';
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 8001;

connectDB();

// Session middleware configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(express.urlencoded({ extended: true }));

app.use('/files', express.static("files"));

app.use("/api/user", userRoutes);
app.use("/api/projectgroup", projectGroupRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/guide", guideRoute);
app.use("/api/meet", meetRoutes);
// app.use('/api', meetRoutes);

// Error Handling Middleware
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err.stack);
  return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
    status: false, 
    message: err.message || 'Internal Server Error' 
  });
};

app.use(errorHandler);

// Catch-all route for undefined paths
const catchAllHandler: RequestHandler = (req, res) => {
  return res
    .status(httpStatus.BAD_REQUEST)
    .json({ status: false, message: "Bad URL Request!" });
};

app.use("*", catchAllHandler);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

server.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`);
});
