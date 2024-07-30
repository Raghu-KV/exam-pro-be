import Joi from "joi";

export const postTestSchema = Joi.object({
  testName: Joi.string().required(),
  examTypeId: Joi.string().required(),
});

export const deleteTest = Joi.object({
  //on params
  id: Joi.string().required(),
  // on body
});

export const updateTestSchema = Joi.object({
  //on params
  id: Joi.string().required(),
  // on body
  testName: Joi.string().required(),
  examTypeId: Joi.string().required(),
});

export const updateTestTimingSchema = Joi.object({
  //on params
  id: Joi.string().required(),
  // on body
  testTiming: Joi.number().required(),
});

export const updateQuestionsSchema = Joi.object({
  //on params
  id: Joi.string().required(),
  // on body
  questionsId: Joi.array().items(Joi.string()).min(10).max(220),
});
