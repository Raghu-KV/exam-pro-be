import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "exames-pro-be API" });
});

export { router };
