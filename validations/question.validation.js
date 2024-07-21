import Joi from "joi";

export const postQuestionSchema = Joi.object({
  question: Joi.string().required(),
  options: Joi.array().items(
    Joi.object({
      optionId: Joi.number().valid(0, 1, 2, 3).required(),
      option: Joi.string().required(),
      name: Joi.string().required(),
    })
  ),
  answerId: Joi.number().valid(0, 1, 2, 3).required(),
  chapterId: Joi.string().required(),
  subjectId: Joi.string().required(),
  examTypeId: Joi.string().required(),
});

export const patchQuestionSchema = Joi.object({
  //on URl - params
  id: Joi.string().required(),
  // on body
  question: Joi.string().required(),
  options: Joi.array().items(
    Joi.object({
      optionId: Joi.number().valid(0, 1, 2, 3).required(),
      option: Joi.string().required(),
      name: Joi.string().required(),
    })
  ),
  answerId: Joi.number().valid(0, 1, 2, 3).required(),
  chapterId: Joi.string().required(),
  subjectId: Joi.string().required(),
  examTypeId: Joi.string().required(),
});

export const deleteQuestionSchema = Joi.object({
  //on URl - params
  id: Joi.string().required(),
  // on body
});
