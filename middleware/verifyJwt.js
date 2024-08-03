import jwt from "jsonwebtoken";

export const verifyJwt = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorizeddddd" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      console.log(error);
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.userName = decoded.userInfo.userName;
    req.role = decoded.userInfo.role;
    req.phoneNo = decoded.userInfo.phoneNo;
    next();
  });
};
