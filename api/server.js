const jsonServer = require("json-server");
const path = require("path");
const fs = require("fs");

const server = jsonServer.create();
const dbPath = path.resolve(__dirname, "../db.json");

// Read the database once at startup
let data = JSON.parse(fs.readFileSync(dbPath, "utf8"));

// Create a custom in-memory router
const createMemoryRouter = (initialData) => {
  const router = jsonServer.router(initialData);
  
  // Override the write method to prevent filesystem access
  router.db.write = () => {
    console.log("📝 In-memory write (no file saved)");
    return Promise.resolve();
  };
  
  return router;
};

const router = createMemoryRouter(data);
const middlewares = jsonServer.defaults();

// CORS — allow all origins
server.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

server.use(middlewares);
server.use(router);

// Error handler to prevent 500 errors from being sent
server.use((err, req, res, next) => {
  console.error("Server error:", err);
  
  // If it's a write error, the operation likely succeeded in memory
  if (err.message && err.message.includes("write")) {
    console.log("⚠️ Write error but data may be in memory");
    // Don't send error if it's a write issue
    return;
  }
  
  res.status(500).json({ error: "Internal server error" });
});

module.exports = server;
