import Joi from "joi";

export const postExamTypeSchema = Joi.object({
  examType: Joi.string().max(10).required(),
});

export const patchExamTypeSchema = Joi.object({
  //on URl - params
  id: Joi.string().required(),
  // on body
  examType: Joi.string().max(10).required(),
});

export const deleteExamTypeSchema = Joi.object({
  //on URl - params
  id: Joi.string().required(),
  // on body
});
