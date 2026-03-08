import { searchFinancialService, getFinancialSummaryService } from "../services/financial.service.js";

export const searchFinancial = async (req, res) => {
  try {
    const results = await searchFinancialService({ ...req.query });
    res.status(200).json({ count: results.length, results });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getFinancialSummary = async (req, res) => {
  try {
    const summary = await getFinancialSummaryService({ ...req.query });
    res.status(200).json(summary);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


