import express from 'express';
import { scheduleMeeting } from '../Controllers/meet.controller';

const router = express.Router();

router.post('/schedule-meeting/:groupId', scheduleMeeting);

export default router;
