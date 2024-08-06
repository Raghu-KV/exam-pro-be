import asyncHandler from "express-async-handler";
import User from "../models/User.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// @desc login a user
// @route POST /auth
// @access public
export const login = asyncHandler(async (req, res) => {
  const { phoneNo, password } = req.body;

  const foundUser = await User.findOne({ phoneNo });

  if (!foundUser)
    return res
      .status(404)
      .json({ message: "Phone No. or password incorrect!" });

  const match = bcrypt.compareSync(password, foundUser.password);

  if (!match)
    return res
      .status(404)
      .json({ message: "Password or Phone No. incorrect!" });

  const accessToken = jwt.sign(
    {
      userInfo: {
        userName: foundUser.userName,
        phoneNo: foundUser.phoneNo,
        role: foundUser.role,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );

  const refershToken = jwt.sign(
    {
      userInfo: {
        userName: foundUser.userName,
        phoneNo: foundUser.phoneNo,
        role: foundUser.role,
      },
    },
    process.env.REFERSH_TOKEN_SECRET,
    { expiresIn: "2d" }
  );

  res.cookie("jwt", refershToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken });
});

// @desc get refresh token
// @route POST /auth/refersh
// @access public - because access token has expired
export const refersh = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFERSH_TOKEN_SECRET,
    asyncHandler(async (error, decoded) => {
      if (error) return res.status(401).json({ message: "Unauthorized" });

      const foundUser = await User.findOne({
        phoneNo: decoded.userInfo.phoneNo,
      });

      if (!foundUser) return res.status(401).json({ message: "Unauthorized" });

      const accessToken = jwt.sign(
        {
          userInfo: {
            userName: foundUser.userName,
            phoneNo: foundUser.phoneNo,
            role: foundUser.role,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "10s" }
      );

      res.json({ accessToken });
    })
  );
};

// @desc logout user
// @route POST /auth/logout
// @access public - just to clear cookie if exists
export const logout = asyncHandler(async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.sendStatus(204); //NO CONTENT

  res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });

  res.json({ message: "Cookie cleared" });
});
