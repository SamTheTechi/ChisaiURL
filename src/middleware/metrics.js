import { httpReqestDurationSec } from "../controller/metrics.js";

export const MetricsMiddleware = () => {
  return (req, res, next) => {
    const end = httpReqestDurationSec.startTimer();
    res.on("finish", () => {
      end({
        method: req.method,
        route: req.route?.path || req.path,
        status_code: req.statusCode,
      });
    });
    next();
  };
};
