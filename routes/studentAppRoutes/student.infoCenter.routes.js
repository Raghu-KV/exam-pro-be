import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyStudentJwt.js";
import { joiValidation } from "../../middleware/joiValidation.js";
import { getInfoSchema } from "../../validations/studentAppValidation/student.infoCenter.validation.js";
import {
  getAllInfosForStudent,
  getSingleInfoForStudent,
} from "../../controller/studentAppController/student.infoCenter.controller.js";

const router = Router();

router.use(verifyJwt);

router.route("/").get(getAllInfosForStudent);
router.route("/:id").get(joiValidation(getInfoSchema), getSingleInfoForStudent);

export { router };
