import { Request, Response } from 'express';
import { google } from 'googleapis';
import { oauth2Client } from '../services/oauth2Client';
import ProjectGroup from '../models/projectGroupModel';
import User from '../models/userModel';
import { IProjectGroup } from '../types/projectGroupType';

export const scheduleMeeting = async (req: Request, res: Response) => {
  const { groupId } = req.body;

  try {
    // Step 1: Get group with populated members and guide
    const group = await ProjectGroup.findById(groupId)
      .populate('members')
      .populate('guideID');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const groupData = group as unknown as IProjectGroup;

    const memberEmails = (group.members as any[]).map((member) => member.email);
    const guideEmail = (group.guideID as any)?.email;

    if (!guideEmail) {
      return res.status(400).json({ message: 'Guide email not found' });
    }

    // Step 2: Create Google Calendar event
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

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

    const response = await calendar.events.insert({
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
  } catch (error) {
    console.error('Failed to schedule meeting:', error);
    return res.status(500).json({ message: 'Failed to schedule meeting' });
  }
};
