import 'dotenv/config';
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();
const PORT = 3000;
const NODE_ENV = "development";

// Test 1: Middlewares de base
app.use(cors());
app.use(express.json({ strict: true, limit: "2mb", type: "application/json" }));

console.log("✅ Test 1: Middlewares de base OK");

// Test 2: Routes simples
app.get("/api/health", (req, res) => {
  res.json({ ok: true, test: "progressive test" });
});

console.log("✅ Test 2: Routes simples OK");

// Test 3: Route avec paramètres
app.get("/api/test/:id", (req, res) => {
  res.json({ id: req.params.id });
});

console.log("✅ Test 3: Routes avec paramètres OK");

app.listen(PORT, () => {
  console.log(`✅ Progressive server on http://localhost:${PORT}`);
});