import { Router } from "express";
import projectGroupCtrl from "../Controllers/ProjectGroup";
import { Authentication } from "../middleware/authMiddleware";

const router = Router();

// Create project group - only authenticated users can create groups
router
  .route("/create")
  .post(Authentication, projectGroupCtrl.createProjectGroup);

  router
  .route("/allgroups")
  .get(Authentication, projectGroupCtrl.getAllGroupsDetails );

router.route('/groups/:groupId').get(Authentication, projectGroupCtrl.getGroupDetails);

export default router;
