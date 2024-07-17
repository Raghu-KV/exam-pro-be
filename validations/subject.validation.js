import Joi from "joi";

export const postSubject = Joi.object({
  // on body
  subjectName: Joi.string().required(),
  examTypeId: Joi.string().required(),
});

export const updateSubject = Joi.object({
  //on params
  id: Joi.string().required(),
  // on body
  subjectName: Joi.string().required(),
  examTypeId: Joi.string().required(),
});

export const deleteSubject = Joi.object({
  //on params
  id: Joi.string().required(),
  // on body
});
