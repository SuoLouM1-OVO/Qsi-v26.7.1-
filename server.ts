import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "20mb" }));

  // Enable CORS for external deployments (e.g. Cloudflare Pages / Workers)
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  const DATA_DIR = path.join(process.cwd(), "data_store");
  const DB_FILE = path.join(DATA_DIR, "db.json");

  // Ensure data store folder exists
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (e) {
      console.warn("Could not create data_store dir:", e);
    }
  }

  // API Routes for Local / China Server-side Direct Synchronization
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", chinaAcceleration: true, timestamp: Date.now() });
  });

  app.get("/api/guestbook", (_req, res) => {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const data = JSON.parse(raw);
        const messages = Array.isArray(data?.guestbook) ? data.guestbook : [];
        return res.json({ success: true, messages });
      }
    } catch (err) {
      console.warn("Error reading guestbook from db.json:", err);
    }
    return res.json({ success: true, messages: [] });
  });

  app.post("/api/guestbook", (req, res) => {
    try {
      const { authorName, email, content, projectId, projectTitle } = req.body || {};
      if (!authorName || !content) {
        return res.status(400).json({ success: false, error: "authorName and content required" });
      }

      let currentData: any = {};
      if (fs.existsSync(DB_FILE)) {
        try {
          const raw = fs.readFileSync(DB_FILE, "utf-8");
          currentData = JSON.parse(raw) || {};
        } catch (e) {}
      }

      const guestbook = Array.isArray(currentData.guestbook) ? currentData.guestbook : [];

      const suitOptions = ['spade', 'heart', 'diamond', 'club'];
      const randomSuit = suitOptions[Math.floor(Math.random() * suitOptions.length)];
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const newMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        authorName: String(authorName).trim(),
        email: email ? String(email).trim() : '',
        content: String(content).trim(),
        projectId: projectId || '',
        projectTitle: projectTitle || '',
        avatarSuit: randomSuit,
        date: dateStr,
        createdAt: now.toISOString()
      };

      const updatedGuestbook = [newMessage, ...guestbook];
      currentData.guestbook = updatedGuestbook;

      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(currentData, null, 2), "utf-8");

      return res.json({ success: true, message: newMessage, messages: updatedGuestbook });
    } catch (err) {
      console.error("Error posting guestbook message:", err);
      return res.status(500).json({ success: false, error: String(err) });
    }
  });

  app.delete("/api/guestbook/:id", (req, res) => {
    try {
      const msgId = req.params.id;
      if (!fs.existsSync(DB_FILE)) {
        return res.json({ success: true, messages: [] });
      }

      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const currentData = JSON.parse(raw) || {};
      const guestbook = Array.isArray(currentData.guestbook) ? currentData.guestbook : [];

      const updatedGuestbook = guestbook.filter((m: any) => m.id !== msgId);
      currentData.guestbook = updatedGuestbook;

      fs.writeFileSync(DB_FILE, JSON.stringify(currentData, null, 2), "utf-8");
      return res.json({ success: true, messages: updatedGuestbook });
    } catch (err) {
      console.error("Error deleting guestbook message:", err);
      return res.status(500).json({ success: false, error: String(err) });
    }
  });

  app.get("/api/sync", (_req, res) => {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const data = JSON.parse(raw);
        return res.json({ success: true, data });
      }
    } catch (err) {
      console.warn("Error reading local db.json:", err);
    }
    return res.json({ success: true, data: null });
  });

  app.post("/api/sync", (req, res) => {
    try {
      const payload = req.body || {};
      // Safeguard: Never overwrite DB with empty projects list
      if (!payload.projects || !Array.isArray(payload.projects) || payload.projects.length === 0) {
        if (fs.existsSync(DB_FILE)) {
          try {
            const raw = fs.readFileSync(DB_FILE, "utf-8");
            const existing = JSON.parse(raw);
            if (Array.isArray(existing?.projects) && existing.projects.length > 0) {
              payload.projects = existing.projects;
            }
          } catch (e) {}
        }
      }

      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), "utf-8");
      return res.json({ success: true, updatedAt: new Date().toISOString() });
    } catch (err) {
      console.error("Error writing local db.json:", err);
      return res.status(500).json({ success: false, error: String(err) });
    }
  });

  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`QSi Studio Server with China Acceleration running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
