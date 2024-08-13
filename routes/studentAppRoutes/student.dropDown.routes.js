import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyStudentJwt.js";
import {
  getAllChapterForDropDown,
  getAllSubjectForDropDown,
} from "../../controller/studentAppController/student.dropDown.controller.js";

const router = Router();

router.use(verifyJwt);

router.route("/allChapters").get(getAllChapterForDropDown);
router.route("/allSubjects").get(getAllSubjectForDropDown);

export { router };
