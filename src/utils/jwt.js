import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";

export const generateToken = (user) => {
  const token = jwt.sign(user, JWT_SECRET, {
    expiresIn: "24h",
  });
  return token;
};

export const getUserData = (token) => {
  const user = jwt.verify(token, JWT_SECRET);
  return user;
};
