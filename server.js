import express from "express";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

// import files dhould end with .js
import { logger, logEvents } from "./middleware/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { connectToDb } from "./config/dbConnection.js";
import { corsOptions } from "./config/corsOptions.js";

// ROUTES
import { router as rootRouter } from "./routes/root.routes.js";
import { router as examTypeRouter } from "./routes/exam-type.routes.js";
import { router as studentsRouter } from "./routes/students.routes.js";
import { router as subjectsRouter } from "./routes/subject.routes.js";
import { router as chapterRouter } from "./routes/chapter.routes.js";
import { router as questionRouter } from "./routes/question.routes.js";
import { router as testRouter } from "./routes/test.routes.js";
import { router as userRouter } from "./routes/user.routes.js";
import { router as authRouter } from "./routes/auth.routes.js";

// STUDENT ROUTES
import { router as studentAuthRouter } from "./routes/studentAppRoutes/student.auth.routes.js";
import { router as studentTestRouter } from "./routes/studentAppRoutes/student.tests.routes.js";
import { router as studentDropDownRouter } from "./routes/studentAppRoutes/student.dropDown.routes.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT;
connectToDb();

//MIDDLEWARES
app.use(cookieParser());
app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());

// ADMIN ROUTES
app.use("/", rootRouter);
app.use("/exam-type", examTypeRouter);
app.use("/students", studentsRouter);
app.use("/subjects", subjectsRouter);
app.use("/chapters", chapterRouter);
app.use("/questions", questionRouter);
app.use("/tests", testRouter);
app.use("/users", userRouter);
app.use("/auth", authRouter);

// STUDENT ROUTES
app.use("/student/auth", studentAuthRouter);
app.use("/student/tests", studentTestRouter);
app.use("/student/dropDown", studentDropDownRouter);

app.all("*", (req, res) => {
  res.status(404).json({ message: "404 Not found" });
});

app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Mongo connected!");
  app.listen(PORT, () => console.log(`server running on port : ${PORT}`));
});

mongoose.connection.on("error", (error) => {
  console.log(error);
  logEvents(`${error.errorResponse.errmsg}`, "mongoErrLog.log");
});
