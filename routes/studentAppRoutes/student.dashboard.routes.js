import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyStudentJwt.js";
import { studentDashboard } from "../../controller/studentAppController/student.dashboard.controller.js";

const router = Router();

router.use(verifyJwt);

router.route("/").get(studentDashboard);

export { router };
