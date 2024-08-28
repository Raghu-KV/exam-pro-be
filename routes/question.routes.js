import { Router } from "express";
import { joiValidation } from "../middleware/joiValidation.js";
import {
  deleteQuestionSchema,
  patchQuestionSchema,
  postQuestionSchema,
} from "../validations/question.validation.js";
import {
  addQuestion,
  deleteQuestion,
  editQuestion,
  generateCloudinarySign,
  getAllQuestions,
  getSingleQuestion,
} from "../controller/question.controller.js";

import { verifyJwt } from "./../middleware/verifyJwt.js";

const router = Router();

router.use(verifyJwt);

router
  .route("/")
  .get(getAllQuestions)
  .post(joiValidation(postQuestionSchema), addQuestion);

router.route("/generateSignature").post(generateCloudinarySign);

router
  .route("/:id")
  .get(joiValidation(deleteQuestionSchema), getSingleQuestion)
  .patch(joiValidation(patchQuestionSchema), editQuestion)
  .delete(joiValidation(deleteQuestionSchema), deleteQuestion);

export { router };
