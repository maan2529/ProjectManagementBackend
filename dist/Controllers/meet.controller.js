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
exports.scheduleMeeting = void 0;
const googleapis_1 = require("googleapis");
const oauth2Client_1 = require("../services/oauth2Client");
const projectGroupModel_1 = __importDefault(require("../models/projectGroupModel"));
const scheduleMeeting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { groupId } = req.body;
    try {
        // Step 1: Get group with populated members and guide
        const group = yield projectGroupModel_1.default.findById(groupId)
            .populate('members')
            .populate('guideID');
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        const groupData = group;
        const memberEmails = group.members.map((member) => member.email);
        const guideEmail = (_a = group.guideID) === null || _a === void 0 ? void 0 : _a.email;
        if (!guideEmail) {
            return res.status(400).json({ message: 'Guide email not found' });
        }
        // Step 2: Create Google Calendar event
        const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client_1.oauth2Client });
        const event = {
            summary: `Project Discussion - ${group.name}`,
            description: 'Google Meet for project discussion',
            start: {
                dateTime: new Date(Date.now() + 10 * 60000).toISOString(), // 10 mins from now
                timeZone: 'Asia/Kolkata',
            },
            end: {
                dateTime: new Date(Date.now() + 40 * 60000).toISOString(), // 30 mins later
                timeZone: 'Asia/Kolkata',
            },
            attendees: memberEmails.map((email) => ({ email })),
            conferenceData: {
                createRequest: {
                    requestId: `meet-${Date.now()}`,
                    conferenceSolutionKey: {
                        type: 'hangoutsMeet',
                    },
                },
            },
            reminders: {
                useDefault: true,
            },
        };
        const response = yield calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
            conferenceDataVersion: 1,
            sendUpdates: 'all',
        });
        const meetLink = response.data.hangoutLink;
        return res.status(200).json({
            message: 'Meeting scheduled successfully',
            meetLink,
            startTime: event.start.dateTime,
            endTime: event.end.dateTime,
        });
    }
    catch (error) {
        console.error('Failed to schedule meeting:', error);
        return res.status(500).json({ message: 'Failed to schedule meeting' });
    }
});
exports.scheduleMeeting = scheduleMeeting;
