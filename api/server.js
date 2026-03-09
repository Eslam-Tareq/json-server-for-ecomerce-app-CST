const jsonServer = require("json-server");
const path = require("path");

const server = jsonServer.create();
const dbPath = path.resolve(__dirname, "../db.json");
const router = jsonServer.router(dbPath);
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

module.exports = server;`
