import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "hospease-secret-key-123";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
// In a real app, you'd store this hashed in a DB. 
// For this demo, we'll hash the env var password for comparison logic.
const ADMIN_PASSWORD_RAW = process.env.ADMIN_PASSWORD || "password";
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(ADMIN_PASSWORD_RAW, 10);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // API Routes
  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_USERNAME && bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "24h" });
      
      res.cookie("admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      return res.json({ 
        success: true, 
        user: { username, role: "admin" } 
      });
    }

    return res.status(401).json({ success: false, message: "Invalid credentials" });
  });

  app.get("/api/me", (req, res) => {
    const token = req.cookies.admin_token;
    if (!token) return res.status(401).json({ authenticated: false });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      res.json({ authenticated: true, user: decoded });
    } catch (err) {
      res.status(401).json({ authenticated: false });
    }
  });

  app.post("/api/logout", (req, res) => {
    res.clearCookie("admin_token");
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
