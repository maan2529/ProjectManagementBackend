import { Router } from 'express';
import guideCtrl from '../Controllers/guideController';
import { Authentication } from '../middleware/authMiddleware';

const router = Router();

// Create project group - only authenticated users can create groups
router.route('/getallGuide').get(Authentication, guideCtrl.getAllGuides);

// Get all guides
router.route("/all").get(guideCtrl.getAllGuides);

// Assign guide to group and project
router.route("/assign/:groupId/:guideId")
    .post(Authentication, guideCtrl.assignGuideToGroupAndProject);

export default router;

