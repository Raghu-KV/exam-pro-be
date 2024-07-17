import { Router } from "express";
import { joiValidation } from "../middleware/joiValidation.js";
import {
  postSubject,
  updateSubject,
  deleteSubject as deleteValidation,
} from "../validations/subject.validation.js";

import {
  addSubject,
  editSubject,
  deleteSubject,
  getSingleSubject,
  getAllSubjects,
  getAllSubjectsWithNoPagination,
} from "../controller/subject.controller.js";

const router = Router();

router
  .route("/")
  .get(getAllSubjects)
  .post(joiValidation(postSubject), addSubject);

router.route("/all").get(getAllSubjectsWithNoPagination);

router
  .route("/:id")
  .get(joiValidation(deleteValidation), getSingleSubject)
  .patch(joiValidation(updateSubject), editSubject)
  .delete(joiValidation(deleteValidation), deleteSubject);

export { router };
