import { Router } from "express";

// Controller
import {
  addExamType,
  editExamType,
  deleteExamType,
  getAllExamType,
  getExamTypeById,
  getExamTypeWithNoPagination,
} from "../controller/examType.controller.js";

import { joiValidation } from "../middleware/joiValidation.js";

import {
  postExamTypeSchema,
  patchExamTypeSchema,
  deleteExamTypeSchema,
} from "../validations/examType.validation.js";

const router = Router();

router
  .route("/")
  .get(getAllExamType)
  .post(joiValidation(postExamTypeSchema), addExamType);

router.route("/all").get(getExamTypeWithNoPagination);

router
  .route("/:id")
  .get(joiValidation(deleteExamTypeSchema), getExamTypeById)
  .patch(joiValidation(patchExamTypeSchema), editExamType)
  .delete(joiValidation(deleteExamTypeSchema), deleteExamType);

export { router };
