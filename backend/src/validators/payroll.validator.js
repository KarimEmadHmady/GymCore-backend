export const validateCreatePayroll = (req, res, next) => {
  const { employeeId, salaryAmount } = req.body;
  if (!employeeId) return res.status(400).json({ message: "employeeId is required" });
  if (salaryAmount === undefined || isNaN(Number(salaryAmount))) return res.status(400).json({ message: "salaryAmount is required and must be a number" });
  next();
};

export const validateListPayroll = (req, res, next) => {
  const { sort, minAmount, maxAmount, from, to } = req.query;
  if (sort && !["asc", "desc"].includes(sort)) return res.status(400).json({ message: "Invalid sort" });
  if (minAmount && isNaN(Number(minAmount))) return res.status(400).json({ message: "minAmount must be number" });
  if (maxAmount && isNaN(Number(maxAmount))) return res.status(400).json({ message: "maxAmount must be number" });
  if (from && isNaN(new Date(from).getTime())) return res.status(400).json({ message: "Invalid from" });
  if (to && isNaN(new Date(to).getTime())) return res.status(400).json({ message: "Invalid to" });
  next();
};


