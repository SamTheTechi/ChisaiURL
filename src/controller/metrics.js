import { collectDefaultMetrics, Registry, Histogram } from "prom-client";

const register = new Registry();

collectDefaultMetrics({ register });

export const httpReqestDurationSec = new Histogram({
  name: "http_request_duration_seconds",
  help: "Durations of HTTP requests in secondes",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.5, 1, 3],
  registers: [register],
});

export const Metrics = async (_, res) => {
  try {
    res.status(200).setHeader("Content-Type", register.contentType);
    return res.end(await register.metrics());
  } catch (e) {
    return res.status(500).json({ message: `can't read metrics` });
  }
};
