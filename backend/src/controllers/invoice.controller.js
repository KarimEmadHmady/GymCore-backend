import {
  createInvoiceService,
  getInvoicesService,
  getInvoiceByIdService,
  updateInvoiceService,
  deleteInvoiceService,
} from "../services/invoice.service.js";

export const createInvoice = async (req, res) => {
  try {
    const doc = await createInvoiceService(req.body);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const data = await getInvoicesService({ ...req.query });
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const doc = await getInvoiceByIdService(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.status(200).json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const doc = await updateInvoiceService(req.params.id, req.body);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.status(200).json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const doc = await deleteInvoiceService(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


