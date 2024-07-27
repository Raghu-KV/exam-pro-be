import { Router } from "express";
import { joiValidation } from "./../middleware/joiValidation.js";
import {
  deleteTest as deleteTestScheme,
  postTestSchema,
  updateTestSchema,
} from "../validations/test.validation.js";
import {
  addTest,
  getAllTests,
  getSingleTest,
  deleteTest,
  prefillTest,
  updateTest,
} from "../controller/test.controller.js";

const router = Router();

router.route("/").get(getAllTests).post(joiValidation(postTestSchema), addTest);

router
  .route("/:id")
  .patch(joiValidation(updateTestSchema), updateTest)
  .delete(joiValidation(deleteTestScheme), deleteTest)
  .get(joiValidation(deleteTestScheme), getSingleTest);

router.route("/:id/prefill").get(joiValidation(deleteTestScheme), prefillTest);

// all the default routes for test

// /publish to publish the test
//  /prepare -questions

export { router };
