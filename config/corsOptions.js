import { allowedOrgin } from "./allowedOrgin.js";

export const corsOptions = {
  origin: (orgin, callback) => {
    if (!orgin || allowedOrgin.indexOf(orgin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};
