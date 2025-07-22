export const PowereBy = () => {
  return (_, res, next) => {
    res.setHeader("X-Powered-By", "Kawai uwu URL");
    next();
  };
};
