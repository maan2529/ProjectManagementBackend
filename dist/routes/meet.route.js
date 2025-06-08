"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const meet_controller_1 = require("../Controllers/meet.controller");
const router = express_1.default.Router();
router.post('/schedule-meeting/:groupId', meet_controller_1.scheduleMeeting);
exports.default = router;
