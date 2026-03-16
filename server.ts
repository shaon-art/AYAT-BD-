import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("movies.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS movies (
    id TEXT PRIMARY KEY,
    title TEXT,
    posterUrl TEXT,
    videoUrl TEXT,
    genre TEXT,
    year TEXT,
    description TEXT,
    status TEXT DEFAULT 'published',
    views INTEGER DEFAULT 0,
    servers TEXT
  );

  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    movieId TEXT,
    movieTitle TEXT,
    timestamp TEXT,
    reason TEXT
  );

  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS channels (
    id TEXT PRIMARY KEY,
    name TEXT,
    logoUrl TEXT,
    streamUrl TEXT,
    category TEXT
  );

  -- Migration: Add servers column if it doesn't exist
  BEGIN;
  SELECT CASE WHEN COUNT(*) = 0 THEN
    'ALTER TABLE movies ADD COLUMN servers TEXT'
  ELSE
    'SELECT 1'
  END FROM pragma_table_info('movies') WHERE name = 'servers';
  COMMIT;
`);

// better-sqlite3 doesn't support conditional ALTER TABLE easily in one exec
try {
  db.prepare("ALTER TABLE movies ADD COLUMN servers TEXT").run();
} catch (e) {
  // Column probably already exists
}

const app = express();
const PORT = 3000;

async function setupApp() {
  app.use(express.json());

  // API Routes
  app.get("/api/movies", (req, res) => {
    try {
      const movies = db.prepare("SELECT * FROM movies").all();
      res.json(movies.map(m => ({
        ...m,
        servers: m.servers ? JSON.parse(m.servers) : (m.videoUrl ? [{ name: 'Server 1', url: m.videoUrl }] : [])
      })));
    } catch (e) {
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/api/movies", (req, res) => {
    const { title, posterUrl, videoUrl, genre, year, description, status, views, servers } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    db.prepare("INSERT INTO movies (id, title, posterUrl, videoUrl, genre, year, description, status, views, servers) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(id, title, posterUrl, videoUrl, genre, year, description, status || 'published', views || 0, JSON.stringify(servers || []));
    res.json({ id, ...req.body });
  });

  app.put("/api/movies/:id", (req, res) => {
    const { id } = req.params;
    const { title, posterUrl, videoUrl, genre, year, description, status, views, servers } = req.body;
    db.prepare("UPDATE movies SET title = ?, posterUrl = ?, videoUrl = ?, genre = ?, year = ?, description = ?, status = ?, views = ?, servers = ? WHERE id = ?")
      .run(title, posterUrl, videoUrl, genre, year, description, status, views || 0, JSON.stringify(servers || []), id);
    res.json({ id, ...req.body });
  });

  app.delete("/api/movies/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM movies WHERE id = ?").run(id);
    res.json({ success: true });
  });

  app.post("/api/movies/:id/view", (req, res) => {
    const { id } = req.params;
    db.prepare("UPDATE movies SET views = views + 1 WHERE id = ?").run(id);
    res.json({ success: true });
  });

  app.get("/api/config/featured", (req, res) => {
    const row = db.prepare("SELECT value FROM config WHERE key = 'featured'").get();
    res.json({ movieId: row ? row.value : '' });
  });

  app.post("/api/config/featured", (req, res) => {
    const { movieId } = req.body;
    db.prepare("INSERT OR REPLACE INTO config (key, value) VALUES ('featured', ?)")
      .run(movieId);
    res.json({ success: true });
  });

  app.get("/api/reports", (req, res) => {
    const reports = db.prepare("SELECT * FROM reports").all();
    res.json(reports);
  });

  app.post("/api/reports", (req, res) => {
    const { movieId, movieTitle, reason } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    const timestamp = new Date().toISOString();
    db.prepare("INSERT INTO reports (id, movieId, movieTitle, timestamp, reason) VALUES (?, ?, ?, ?, ?)")
      .run(id, movieId, movieTitle, timestamp, reason);
    res.json({ id, ...req.body, timestamp });
  });

  app.delete("/api/reports/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM reports WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Category Endpoints
  app.get("/api/categories", (req, res) => {
    const categories = db.prepare("SELECT * FROM categories").all();
    res.json(categories);
  });

  app.post("/api/categories", (req, res) => {
    const { name } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    try {
      db.prepare("INSERT INTO categories (id, name) VALUES (?, ?)").run(id, name);
      res.json({ id, name });
    } catch (e) {
      res.status(400).json({ error: "Category already exists" });
    }
  });

  app.put("/api/categories/:id", (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    db.prepare("UPDATE categories SET name = ? WHERE id = ?").run(name, id);
    res.json({ id, name });
  });

  app.delete("/api/categories/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM categories WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Channel Routes
  app.get("/api/channels", (req, res) => {
    try {
      const channels = db.prepare("SELECT * FROM channels").all();
      res.json(channels);
    } catch (e) {
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/api/channels", (req, res) => {
    const { name, logoUrl, streamUrl, category } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    db.prepare("INSERT INTO channels (id, name, logoUrl, streamUrl, category) VALUES (?, ?, ?, ?, ?)")
      .run(id, name, logoUrl, streamUrl, category);
    res.json({ id, ...req.body });
  });

  app.put("/api/channels/:id", (req, res) => {
    const { id } = req.params;
    const { name, logoUrl, streamUrl, category } = req.body;
    db.prepare("UPDATE channels SET name = ?, logoUrl = ?, streamUrl = ?, category = ? WHERE id = ?")
      .run(name, logoUrl, streamUrl, category, id);
    res.json({ id, ...req.body });
  });

  app.delete("/api/channels/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM channels WHERE id = ?").run(id);
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

setupApp();

export default app;
