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
} from "../controller/chapter.controller.js";

const router = Router();

router
  .route("/")
  .get(getAllChapters)
  .post(joiValidation(postChapterSchema), addChapter);

router.route("/all").get(getAllChaptersWithNoPagination);

router
  .route("/:id")
  .get(getSingleChapter)
  .patch(joiValidation(patchChapterSchema), editChapter)
  .delete(joiValidation(deleteChapterSchema), deleteChapter);

export { router };
