import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize SQLite Database
  const db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });

  // Create tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT,
      branch TEXT,
      department TEXT,
      language TEXT,
      scheduling INTEGER,
      reception INTEGER,
      waiting INTEGER,
      cleanliness INTEGER,
      doctor_prof INTEGER,
      diagnosis_clarity INTEGER,
      overall_exp INTEGER,
      recommend INTEGER,
      comment TEXT,
      userName TEXT,
      userPhone TEXT
    );

    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Set default password if not exists
  const existingPassword = await db.get("SELECT value FROM config WHERE key = 'password'");
  if (!existingPassword) {
    await db.run("INSERT INTO config (key, value) VALUES ('password', 'admin')");
  }

  // API Routes
  app.get("/api/config", async (req, res) => {
    try {
      const row = await db.get("SELECT value FROM config WHERE key = 'password'");
      res.json({ password: row ? row.value : "admin" });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch config" });
    }
  });

  app.post("/api/updatePassword", async (req, res) => {
    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ error: "Password required" });
    try {
      await db.run("UPDATE config SET value = ? WHERE key = 'password'", newPassword);
      res.json({ result: "success" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update password" });
    }
  });

  app.get("/api/dashboard", async (req, res) => {
    try {
      const rows = await db.all("SELECT * FROM responses ORDER BY id DESC");
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  app.post("/api/submit", async (req, res) => {
    const data = req.body;
    try {
      await db.run(`
        INSERT INTO responses (
          timestamp, branch, department, language, 
          scheduling, reception, waiting, cleanliness, 
          doctor_prof, diagnosis_clarity, overall_exp, 
          recommend, comment, userName, userPhone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        data.timestamp, data.branch, data.department, data.language,
        data.scheduling, data.reception, data.waiting, data.cleanliness,
        data.doctor_prof, data.diagnosis_clarity, data.overall_exp,
        data.recommend, data.comment, data.userName, data.userPhone
      ]);
      res.json({ result: "success" });
    } catch (error) {
      console.error("Submission error:", error);
      res.status(500).json({ error: "Failed to submit survey" });
    }
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
