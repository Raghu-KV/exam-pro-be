import Joi from "joi";

export const postStudentSchema = Joi.object({
  // on body
  studentName: Joi.string().required(),
  rollNo: Joi.string().required(),
  phoneNo: Joi.number().required(),
  enrolledExamTypeId: Joi.string().required(),
  groupId: Joi.string().required(),
});

export const updateStudentSchema = Joi.object({
  //on params
  id: Joi.string().required(),
  // on body
  studentName: Joi.string().required(),
  rollNo: Joi.string().required(),
  phoneNo: Joi.number().required(),
  enrolledExamTypeId: Joi.string().required(),
  groupId: Joi.string().required(),
});

export const deleteStudentSchema = Joi.object({
  //on params
  id: Joi.string().required(),
  // on body
});
