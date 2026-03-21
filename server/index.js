// server/index.js
import express from "express";
import cors    from "cors";
import { router } from "./routes/index.js";

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:4173", "*"] }));
app.use(express.json({ limit: "1mb" }));
app.use("/api", router);

app.get("/", (_req, res) => res.json({
  name:    "Shattered Game Server",
  version: "0.2.0",
  status:  "online",
  docs:    "POST /api/players/sync | GET /api/leaderboard | POST /api/attack | POST /api/ai/event",
}));

app.listen(PORT, () => {
  console.log(`\n  ▣ SHATTERED SERVER — port ${PORT}`);
  console.log(`  ▸ API: http://localhost:${PORT}/api`);
  console.log(`  ▸ Anthropic key: ${process.env.ANTHROPIC_API_KEY ? "✓ loaded" : "✗ missing (AI events disabled)"}\n`);
});
