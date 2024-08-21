import moment from "moment";
import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

export const logEvents = async (message, logFileName) => {
  const formatDate = moment().format("MMMM Do YYYY, h:mm:ss a");
  const logItem = `${formatDate}\t${crypto.randomUUID()}\t${message}\n`;

  try {
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "..", "app-logs"));
    }

    fsPromises.appendFile(
      path.join(__dirname, "..", "logs", logFileName),
      logItem
    );
  } catch (error) {
    console.log(error);
  }
};

export const logger = (req, res, next) => {
  logEvents(`${req.method}\t${req.url}\t${req.headers.orgin}`, "reqLog.log");

  console.log(`${req.method}  ${req.path}`);

  next();
};
