import { rateLimit } from "express-rate-limit";
import { logEvents } from "./logger.js";

const loginLimitter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  message: { message: "To many attempts to login" },
  handler: (req, res, next, options) => {
    logEvents(
      `Too many request : ${options.message.message}\t${req.method}\t${req.url}`,
      "errLog.log"
    );
    res.status(options.statusCode).send(options.message);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export { loginLimitter };
