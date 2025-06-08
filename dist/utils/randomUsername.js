"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = generateUniqueUsername;
const userModel_1 = __importDefault(require("../models/userModel"));
function generateUniqueUsername(input) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!input || typeof input !== 'string') {
            throw new Error('Invalid input: a valid email or name is required.');
        }
        // Extract base username from email or use the input directly
        const baseUsername = input.includes('@') ? input.split('@')[0] : input;
        let isUnique = false;
        let finalUsername = '';
        while (!isUnique) {
            const randomNumber = Math.floor(100 + Math.random() * 900); // Generate a random 3-digit number
            finalUsername = `${baseUsername}${randomNumber}`;
            // Check if the generated username already exists
            const exists = yield userModel_1.default.findOne({ username: finalUsername });
            if (!exists) {
                isUnique = true;
            }
        }
        return finalUsername;
    });
}
