"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const connectdb_1 = __importDefault(require("./config/connectdb"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8001;
(0, connectdb_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use('/api/user', userRoutes_1.default);
app.listen(PORT, () => {
    console.log(`Server Runnig on Port ${PORT}`);
});
