import { Router } from "express";
import { joiValidation } from "../middleware/joiValidation.js";
import {
  postChapterSchema,
  patchChapterSchema,
  deleteChapterSchema,
} from "../validations/chapter.validation.js";

import {
  addChapter,
  deleteChapter,
  editChapter,
  getAllChapters,
  getAllChaptersWithNoPagination,
  getSingleChapter,
  getSingleChapterView,
} from "../controller/chapter.controller.js";

import { verifyJwt } from "./../middleware/verifyJwt.js";

const router = Router();

router.use(verifyJwt);

router
  .route("/")
  .get(getAllChapters)
  .post(joiValidation(postChapterSchema), addChapter);

router.route("/all").get(getAllChaptersWithNoPagination);

router
  .route("/view/:id")
  .get(joiValidation(deleteChapterSchema), getSingleChapterView);

router
  .route("/:id")
  .get(getSingleChapter)
  .patch(joiValidation(patchChapterSchema), editChapter)
  .delete(joiValidation(deleteChapterSchema), deleteChapter);

export { router };
