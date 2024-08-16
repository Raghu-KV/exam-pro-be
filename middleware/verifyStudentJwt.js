import jwt from "jsonwebtoken";

export const verifyJwt = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(
    token,
    process.env.STUDENT_ACCESS_TOKEN_SECRET,
    (error, decoded) => {
      if (error) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      req.studentName = decoded.userInfo.studentName;
      req.rollNo = decoded.userInfo.rollNo;
      req.examTypeId = decoded.userInfo.examTypeId;
      req.studentId = decoded.userInfo.studentId;
      req.groupId = decoded.userInfo.groupId;
      next();
    }
  );
};
