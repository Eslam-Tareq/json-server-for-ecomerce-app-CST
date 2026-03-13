require("dotenv").config();
const jsonServer = require("json-server");
const path = require("path");
const fs = require("fs");
const { MongoClient } = require("mongodb");

const server = jsonServer.create();
const dbPath = path.resolve(__dirname, "../db.json");
const client = new MongoClient(process.env.MONGODB_URI);

const getDb = async () => {
  await client.connect();
  const db = client.db("");
  console.log(db);
  const col = db.collection("data");
  const doc = await col.findOne({ _id: "db" });
  if (doc) return doc.data;

  // First run: seed from db.json
  const seed = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  await col.insertOne({ _id: "db", data: seed });
  return seed;
};

const saveDb = async (data) => {
  await client.connect();
  const db = client.db("mydb");
  await db
    .collection("data")
    .updateOne({ _id: "db" }, { $set: { data } }, { upsert: true });
};

const middlewares = jsonServer.defaults();

// CORS — allow all origins
server.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

server.use(middlewares);
server.use(jsonServer.bodyParser);

// On every request: load from MongoDB, process, save back
server.use(async (req, res, next) => {
  try {
    const data = await getDb();
    const router = jsonServer.router(data);

    // Persist writes back to MongoDB
    router.db.write = async () => {
      const updatedData = router.db.getState();
      await saveDb(updatedData);
      console.log("✅ Saved to MongoDB");
    };

    router(req, res, next);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = server;
