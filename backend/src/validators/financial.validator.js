export const validateFinancialSearch = (req, res, next) => {
  const { type, sort, minAmount, maxAmount, from, to } = req.query;
  const allowedTypes = ["revenue", "expense", "invoice", "payroll", "payment", "purchase", "all", undefined];
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({ message: "Invalid type parameter" });
  }
  if (sort && !["asc", "desc"].includes(sort)) {
    return res.status(400).json({ message: "Invalid sort parameter" });
  }
  if (minAmount && isNaN(Number(minAmount))) return res.status(400).json({ message: "minAmount must be a number" });
  if (maxAmount && isNaN(Number(maxAmount))) return res.status(400).json({ message: "maxAmount must be a number" });
  if (from && isNaN(new Date(from).getTime())) return res.status(400).json({ message: "Invalid from date" });
  if (to && isNaN(new Date(to).getTime())) return res.status(400).json({ message: "Invalid to date" });
  next();
};

export const validateFinancialSummary = (req, res, next) => {
  const { sort, from, to } = req.query;
  if (sort && !["asc", "desc"].includes(sort)) {
    return res.status(400).json({ message: "Invalid sort parameter" });
  }
  if (from && isNaN(new Date(from).getTime())) return res.status(400).json({ message: "Invalid from date" });
  if (to && isNaN(new Date(to).getTime())) return res.status(400).json({ message: "Invalid to date" });
  next();
};


