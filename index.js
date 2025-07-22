import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { Redirect } from "./src/controller/redirect.js";
import { Short } from "./src/controller/short.js";
import { Metrics } from "./src/controller/metrics.js";
import { MetricsMiddleware } from "./src/middleware/metrics.js";
import { PowereBy } from "./src/middleware/poweredBy.js";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors());
app.use(PowereBy());
app.use(MetricsMiddleware());
app.use(express.static(path.join(__dirname, "./public")));

app.get("/api/metrics", Metrics);
app.post("/chisai", Short);
app.get("/:redirect", Redirect);
app.get("*", (_, res) => {
  res.sendFile(path.resolve(__dirname, "./public", "index.html"));
});

const port = process.env.PORT || process.env.LOCALPORT;

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server is running at http://0.0.0.0:${port}`);
    });
  } catch (e) {
    console.log(e);
  }
};

start();
