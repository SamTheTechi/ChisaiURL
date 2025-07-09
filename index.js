import { fileURLToPath } from "url";
import { URL } from "./model.js";
import { nanoid } from "nanoid";
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import cors from "cors";
import Redis from "ioredis";

dotenv.config();
const redis = new Redis(process.env.REDIS_KEY);

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const port = parseInt(process.env.PORT || process.env.LOCALPORT || "5000", 10);

app.post("/chisai", async (req, res) => {
  const originalUrl = req.body.originalUrl;

  try {
    const key = `chisai_original_short:${originalUrl}`;

    // hit cache first
    const cached = await redis.get(key);
    if (cached) {
      console.log("hit redis");
      return res
        .status(200)
        .json({ url: cached, msg: `Short URL already exists.` });
    }

    // check db if the url already existes or not
    const exists = await URL.findOne({ original: originalUrl });
    if (exists) {
      // save into cache
      await redis.set(key, exists.short);

      return res
        .status(200)
        .json({ url: exists.short, msg: `Short URL already exists.` });
    }

    // create new instance
    const uid = nanoid(7);
    await URL.create({
      original: originalUrl,
      short: uid,
    });

    // save into cache
    await redis.set(key, uid);

    return res.status(200).json({ url: uid, msg: `New short URL created!` });
  } catch (e) {
    res
      .status(401)
      .json({ url: `Error occurred`, msg: `Unexpected error: ${e}` });
  }
});

app.get("/:short", async (req, res) => {
  const param = req.params.short;

  if (!param) {
    res.status(400).json({ msg: `Provide params` });
  }

  try {
    const key = `chisai_short_original:${param}`;

    // try redis cache
    const cached = await redis.get(key);
    if (cached) {
      console.log("hit redis");
      return res.redirect(cached);
    }

    // fallback to DB
    const url = await URL.findOne({ short: param });
    if (!url) {
      return res.status(404).json({ msg: `URL not found` });
    }

    // cache it for furture requests (for 2 days)
    await redis.set(key, url.original, "EX", 60 * 60 * 24);

    return res.redirect(url.original);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ msg: `Server error: ${e}` });
  }
});

app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL),
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      };
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  } catch (e) {
    console.log(e);
  }
};

start();
