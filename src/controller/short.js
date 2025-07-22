import { redis } from "../core/redis.js";
import { nanoid } from "nanoid";
import { URL } from "../core/model.js";

export const Short = async (req, res) => {
  const originalUrl = req.body.originalUrl;

  try {
    const key = `chisai_original_short:${originalUrl}`;

    const cached = await redis.get(key);
    if (cached) {
      console.log("hit redis");
      return res
        .status(200)
        .json({ url: cached, msg: `Short URL already exists.` });
    }

    // Define a dustributed lock key
    const lockKey = `lock:${originalUrl}`;

    try {
      // 3 sec expiry time to prevent originalUrl lock in case of server crash
      const lockAcquired = await redis.set(lockKey, "true", "PX", 3000, "NX");

      // lock not accurited hence return to prevent race condition
      if (!lockAcquired) {
        return res.status(409).json({
          msg: "This URL is currently being processed. Please try again in a moment.",
        });
      }

      // check last time if the short exist in db before creating new short
      const exists = await URL.findOne({ original: originalUrl });
      if (exists) {
        await redis.set(key, exists.short);
        return res
          .status(200)
          .json({ url: exists.short, msg: `Short URL already exists.` });
      }

      const uid = nanoid(7);
      await URL.create({
        original: originalUrl,
        short: uid,
      });

      await redis.set(key, uid);

      return res.status(200).json({ url: uid, msg: `New short URL created!` });
    } finally {
      // release the key whatever happend
      await redis.del(lockKey);
    }
  } catch (e) {
    res
      .status(500)
      .json({ url: `Error occurred`, msg: `Unexpected error: ${e}` });
  }
};
