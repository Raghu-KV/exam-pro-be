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
  getSingleSubjectView,
} from "../controller/subject.controller.js";

import { verifyJwt } from "./../middleware/verifyJwt.js";

const router = Router();

router.use(verifyJwt);

router
  .route("/")
  .get(getAllSubjects)
  .post(joiValidation(postSubject), addSubject);

router.route("/all").get(getAllSubjectsWithNoPagination);

router
  .route("/view/:id")
  .get(joiValidation(deleteValidation), getSingleSubjectView);

router
  .route("/:id")
  .get(joiValidation(deleteValidation), getSingleSubject)
  .patch(joiValidation(updateSubject), editSubject)
  .delete(joiValidation(deleteValidation), deleteSubject);

export { router };
