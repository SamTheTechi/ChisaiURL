import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from "url";
import path from 'path';
import cors from 'cors';
import { URL } from './model.js';
import { nanoid } from 'nanoid';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const port = parseInt(process.env.PORT || process.env.LOCALPORT || "5000", 10);

app.post("/chisai", async (req, res) => {
  const { originalUrl } = req.body;
  console.log(`Received data: ${originalUrl}`);
  try {
    const doExist = await URL.findOne({ original: originalUrl });
    if (!doExist) {
      const sid = nanoid(7);
      await URL.create({
        original: originalUrl,
        short: sid,
      });
      res.status(200).json({ url: sid, msg: `New short URL created!` });
    } else {
      res.status(200).json({ url: doExist.short, msg: `Short URL already exists.` });
    }
  } catch (e) {
    res.status(401).json({ url: `Error occurred`, msg: `Unexpected error: ${e}` });
  }
});

app.get("/:short", async (req, res) => {
  try {
    const url = await URL.findOne({ short: req.params.short });
    console.log(`Found URL: ${url}`);
    if (url) return res.redirect(url.original);
    res.status(404).json({ msg: `URL not found` });
  } catch (e) {
    res.status(500).json({ msg: `Server error: ${e}` });
  }
});

app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL), {
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

