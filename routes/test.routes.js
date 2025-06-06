import { Router } from "express";
import { joiValidation } from "./../middleware/joiValidation.js";
import {
  deleteTest as deleteTestScheme,
  postTestSchema,
  updateQuestionsSchema,
  updateTestSchema,
  updateTestTimingSchema,
} from "../validations/test.validation.js";
import {
  addTest,
  getAllTests,
  getSingleTest,
  deleteTest,
  prefillTest,
  updateTest,
  updateTiming,
  getQuestionsOnTest,
  changePublish,
  getQuestionsOnTestWithNoPagination,
  updateQuestionsForTest,
  getCompletedStudents,
  getIncompleteStudents,
} from "../controller/test.controller.js";

import { verifyJwt } from "./../middleware/verifyJwt.js";

const router = Router();

router.use(verifyJwt);

router.route("/").get(getAllTests).post(joiValidation(postTestSchema), addTest);

router
  .route("/:id")
  .patch(joiValidation(updateTestSchema), updateTest)
  .delete(joiValidation(deleteTestScheme), deleteTest)
  .get(joiValidation(deleteTestScheme), getSingleTest);

router.route("/:id/prefill").get(joiValidation(deleteTestScheme), prefillTest);

router
  .route("/:id/updateTiming")
  .patch(joiValidation(updateTestTimingSchema), updateTiming);

router
  .route("/:id/publish")
  .post(joiValidation(deleteTestScheme), changePublish);

router
  .route("/:id/updateQuestions")
  .patch(joiValidation(updateQuestionsSchema), updateQuestionsForTest);

router
  .route("/:id/getQuestionsNoPagination")
  .get(joiValidation(deleteTestScheme), getQuestionsOnTestWithNoPagination);
router
  .route("/:id/getQuestions")
  .get(joiValidation(deleteTestScheme), getQuestionsOnTest);

router
  .route("/:id/getCompletedStudents")
  .get(joiValidation(deleteTestScheme), getCompletedStudents);

router
  .route("/:id/getIncompleteStudents")
  .get(joiValidation(deleteTestScheme), getIncompleteStudents);

// all the default routes for test

// /publish to publish the test
//  /prepare -questions

export { router };
