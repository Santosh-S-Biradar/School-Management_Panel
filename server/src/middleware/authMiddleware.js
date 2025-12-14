// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const protect = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization || "";
      const tokenFromHeader = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
      const token = tokenFromHeader || req.cookies?.token || req.query?.token;

      if (!token) {
        return res.status(401).json({ message: "Not authorized, token missing" });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // attach user info to req.user
        req.user = decoded;
        // if allowedRoles is provided and non-empty, enforce role
        if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
          if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden: insufficient permissions" });
          }
        }
        return next();
      } catch (verifyErr) {
        console.error("JWT verify error:", verifyErr?.message || verifyErr);
        // instruct client to clear auth token if invalid
        res.clearCookie && res.clearCookie("token");
        return res.status(401).json({ message: "Invalid or expired token" });
      }
    } catch (err) {
      console.error("authMiddleware error:", err);
      return res.status(500).json({ message: "Server error in auth middleware" });
    }
  };
};
