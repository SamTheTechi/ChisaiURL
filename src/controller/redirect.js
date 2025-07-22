import { redis } from "../core/redis.js";
import { URL } from "../core/model.js";

export const Redirect = async (req, res) => {
  const param = req.params.redirect;

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

    // cache it for furture requests (for 5 days)
    await redis.set(key, url.original, "EX", 60 * 60 * 24 * 5);

    return res.redirect(url.original);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ msg: `Server error: ${e}` });
  }
};
