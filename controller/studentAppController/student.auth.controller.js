import asyncHandler from "express-async-handler";
import Student from "./../../models/Student.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// @desc login a student
// @route POST /student/auth
// @access public
export const studentLogin = asyncHandler(async (req, res) => {
  const { rollNo, password } = req.body;

  const foundUser = await Student.findOne({ rollNo }).select("+password");

  if (!foundUser)
    return res.status(404).json({ message: "Roll No. or password incorrect!" });

  const match = bcrypt.compareSync(password, foundUser.password);

  if (!match)
    return res.status(404).json({ message: "Password or Roll No. incorrect!" });

  const accessToken = jwt.sign(
    {
      userInfo: {
        studentName: foundUser.studentName,
        rollNo: foundUser.rollNo,
        examTypeId: foundUser.enrolledExamTypeId,
        studentId: foundUser.studentId,
        groupId: foundUser.groupId,
      },
    },
    process.env.STUDENT_ACCESS_TOKEN_SECRET,
    { expiresIn: "3h" }
  );

  const refreshToken = jwt.sign(
    {
      userInfo: {
        studentName: foundUser.studentName,
        rollNo: foundUser.rollNo,
        examTypeId: foundUser.enrolledExamTypeId,
        studentId: foundUser.studentId,
        groupId: foundUser.groupId,
      },
    },
    process.env.STUDENT_REFRESH_TOKEN_SECRET,
    { expiresIn: "2d" }
  );

  res.cookie("studentJwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken });
});

// @desc get refresh token
// @route POST /student/auth/refersh
// @access public - because access token has expired
export const studentRefresh = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.studentJwt)
    return res.status(401).json({ message: "Unauthorized" });

  const refreshToken = cookies.studentJwt;

  jwt.verify(
    refreshToken,
    process.env.STUDENT_REFRESH_TOKEN_SECRET,
    asyncHandler(async (error, decoded) => {
      if (error) res.status(401).json({ message: "Unauthorized" });

      const foundUser = await Student.findOne({
        rollNo: decoded.userInfo.rollNo,
      });

      if (!foundUser) return res.status(401).json({ message: "Unauthorized" });

      const accessToken = jwt.sign(
        {
          userInfo: {
            studentName: foundUser.studentName,
            rollNo: foundUser.rollNo,
            examTypeId: foundUser.enrolledExamTypeId,
            studentId: foundUser.studentId,
            groupId: foundUser.groupId,
          },
        },
        process.env.STUDENT_ACCESS_TOKEN_SECRET,
        { expiresIn: "3h" }
      );

      res.json({ accessToken });
    })
  );
};

// @desc change student password
// @route POST /student/auth/changePassword
// @access private
export const changePassword = asyncHandler(async (req, res) => {
  const studentId = req.studentId;

  const { oldPassword, newPassword } = req.body;

  if (!studentId) {
    return res
      .status(404)
      .json({ message: "Could not change password, StudentId not found!!" });
  }

  const foundStudent = await Student.findOne({ studentId }).select("+password");

  if (!foundStudent) {
    return res.status(404).json({ message: "Student not found!!" });
  }

  const match = bcrypt.compareSync(oldPassword, foundStudent.password);

  if (!match) {
    return res.status(404).json({
      message: "Could not change password, Entered old password is incorrect!!",
    });
  }

  const hash = bcrypt.hashSync(newPassword, 10);

  foundStudent.password = hash;
  foundStudent.rawPassword = newPassword;
  await foundStudent.save();

  res.json({ message: "Password changed successfully" });
});

// @desc logout student
// @route POST /student/auth/logout
// @access public - just to clear cookie if exists
export const studentLogout = asyncHandler(async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.studentJwt) return res.sendStatus(204); //NO CONTENT

  res.clearCookie("studentJwt", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  res.json({ message: "Cookie cleared" });
});
