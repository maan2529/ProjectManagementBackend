"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const connectdb_1 = __importDefault(require("./config/connectdb"));
const http_status_1 = __importDefault(require("http-status"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const studentRoutes_1 = __importDefault(require("./routes/studentRoutes"));
const guideRoutes_1 = __importDefault(require("./routes/guideRoutes"));
const projectGroupRoute_1 = __importDefault(require("./routes/projectGroupRoute"));
const http_1 = __importDefault(require("http"));
const socket_1 = require("./socket");
const express_session_1 = __importDefault(require("express-session"));
const meet_route_1 = __importDefault(require("./routes/meet.route"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8001;
(0, connectdb_1.default)();
// Session middleware configuration
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
app.use(express_1.default.json());
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/files', express_1.default.static("files"));
app.use("/api/user", userRoutes_1.default);
app.use("/api/projectgroup", projectGroupRoute_1.default);
app.use("/api/project", projectRoutes_1.default);
app.use("/api/student", studentRoutes_1.default);
app.use("/api/guide", guideRoutes_1.default);
app.use("/api/meet", meet_route_1.default);
// app.use('/api', meetRoutes);
// Error Handling Middleware
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    return res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: err.message || 'Internal Server Error'
    });
};
app.use(errorHandler);
// Catch-all route for undefined paths
const catchAllHandler = (req, res) => {
    return res
        .status(http_status_1.default.BAD_REQUEST)
        .json({ status: false, message: "Bad URL Request!" });
};
app.use("*", catchAllHandler);
// Create HTTP server
const server = http_1.default.createServer(app);
// Initialize Socket.io
(0, socket_1.initializeSocket)(server);
server.listen(PORT, () => {
    console.log(`Server Running on Port ${PORT}`);
});
