export const validateCreateInvoice = (req, res, next) => {
  const { invoiceNumber, userId, amount } = req.body;
  // invoiceNumber becomes optional; backend will auto-generate if missing
  if (!userId) return res.status(400).json({ message: "userId is required" });
  if (amount === undefined || isNaN(Number(amount))) return res.status(400).json({ message: "amount is required and must be a number" });
  next();
};

export const validateListInvoice = (req, res, next) => {
  const { sort, minAmount, maxAmount, from, to, status } = req.query;
  if (sort && !["asc", "desc"].includes(sort)) return res.status(400).json({ message: "Invalid sort" });
  if (minAmount && isNaN(Number(minAmount))) return res.status(400).json({ message: "minAmount must be number" });
  if (maxAmount && isNaN(Number(maxAmount))) return res.status(400).json({ message: "maxAmount must be number" });
  if (from && isNaN(new Date(from).getTime())) return res.status(400).json({ message: "Invalid from" });
  if (to && isNaN(new Date(to).getTime())) return res.status(400).json({ message: "Invalid to" });
  if (status && !["paid","pending","overdue"].includes(status)) return res.status(400).json({ message: "Invalid status" });
  next();
};


