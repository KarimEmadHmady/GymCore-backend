export const validateCreateRevenue = (req, res, next) => {
  const { amount, sourceType } = req.body;
  if (amount === undefined || isNaN(Number(amount))) return res.status(400).json({ message: "amount is required and must be a number" });
  const allowedSources = ["subscription", "purchase", "invoice", "other"];
  if (!allowedSources.includes(req.body.sourceType)) return res.status(400).json({ message: "sourceType must be subscription|purchase|other" });
  next();
};

export const validateListRevenue = (req, res, next) => {
  const { sort, minAmount, maxAmount, from, to } = req.query;
  if (sort && !["asc", "desc"].includes(sort)) return res.status(400).json({ message: "Invalid sort" });
  if (minAmount && isNaN(Number(minAmount))) return res.status(400).json({ message: "minAmount must be number" });
  if (maxAmount && isNaN(Number(maxAmount))) return res.status(400).json({ message: "maxAmount must be number" });
  if (from && isNaN(new Date(from).getTime())) return res.status(400).json({ message: "Invalid from" });
  if (to && isNaN(new Date(to).getTime())) return res.status(400).json({ message: "Invalid to" });
  next();
};


