import express from "express";
import cors from "cors";

const app = express();
const PORT = 3000;

// Middlewares de base
app.use(cors());
app.use(express.json());

// Routes simples
app.get("/api/health", (req, res) => {
  res.json({ ok: true, test: "minimal server works" });
});

app.listen(PORT, () => {
  console.log(`✅ Minimal server on http://localhost:${PORT}`);
});