import Joi from "joi";

export const postChapterSchema = Joi.object({
  chapterName: Joi.string().required(),
  subjectId: Joi.string().required(),
  examTypeId: Joi.string().required(),
});

export const patchChapterSchema = Joi.object({
  //on URl - params
  id: Joi.string().required(),
  // on body
  chapterName: Joi.string().required(),
  subjectId: Joi.string().required(),
  examTypeId: Joi.string().required(),
});

export const deleteChapterSchema = Joi.object({
  //on URl - params
  id: Joi.string().required(),
  // on body
});
