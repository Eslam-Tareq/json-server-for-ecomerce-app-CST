const jsonServer = require("json-server");
const server = jsonServer.create();
const path = require("path");

const dbPath = path.resolve(__dirname, "../db.json");
const router = jsonServer.router(dbPath);
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(router);

server.use((req, res, next) => {
  next();
});

module.exports = server;
