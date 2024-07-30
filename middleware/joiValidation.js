export const joiValidation = (joiSchema) => {
  return function (req, res, next) {
    const value = joiSchema.validate(
      { ...req.params, ...req.body },
      { abortEarly: false }
    );

    if (value.error) {
      return res.status(400).json({
        status: "joi validation failed",
        message: value.error.details[0].message,
      });
    } else {
      next();
    }
  };
};

// export function joiValidation(schema) {
//     return (req, res, next) => {
//       const { error } = schema.validate(req.body);
//       if (error) {
//         // Handle validation error
//         return res.status(400).json({ error: error.details[0].message });
//       }
//       // Validation passed, proceed to next middleware or route handler
//       next();
//     };
//   }
