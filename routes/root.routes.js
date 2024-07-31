import { Router } from "express";

import { verifyJwt } from "./../middleware/verifyJwt.js";

const router = Router();

// router.use(verifyJwt);

router.get("/", (req, res) => {
  res.json({ message: "exames-pro-be API" });
});

export { router };
