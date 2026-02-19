import jwt from "jsonwebtoken";

export const generateToken = (payload, expiresIn = "1d") =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
