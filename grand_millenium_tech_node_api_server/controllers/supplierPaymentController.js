const { response } = require("express");
const db = require("../models");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/files");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, "file-" + uniqueSuffix + extension);
  },
});

const upload = multer({ storage: storage });

const Folder = db.folders;
const SupplierInvoice = db.supplierInvoices;
const SupplierPaymentHistory = db.supplierPaymentHistorys;

const uploadFilesToSupplierPayment = async (req, res) => {
  try {
    const folderId = req.params.folderId;
    const invoiceId = req.params.invoiceId;
    const phId = req.params.phId;
    const files = req.files;
    ("");

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    if (!folderId) {
      return res.status(400).json({ message: "Folder ID is required" });
    }
    if (!invoiceId) {
      return res.status(400).json({ message: "Invoice Id is required" });
    }
    if (!phId) {
      return res
        .status(400)
        .json({ message: "Payment History Id is required" });
    }

    const existingInvoiceId = await SupplierInvoice.findOne({
      where: { invoiceId: invoiceId },
    });

    if (!existingInvoiceId) {
      return res
        .status(400)
        .json({ message: "This Invoice ID cannot be found" });
    }

    const duplicateInvoiceId = await SupplierPaymentHistory.findOne({
      where: { invoiceId: invoiceId },
    });

    if (duplicateInvoiceId) {
      return res.status(400).json({
        message: "This Invoice ID has been linked to a Payment History",
      });
    }

    const folder = await Folder.findByPk(folderId);
    if (!folder) {
      req.files.forEach((file) => {
        fs.unlinkSync(file.path);
      });
      return res.status(404).json({ message: "Folder not found" });
    }

    const newFiles = await Promise.all(
      files.map(async (file) => {
        const newFile = await SupplierPaymentHistory.create({
          paymentHistoryID: phId,
          filename: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
          filePath: file.path,
          invoiceId: invoiceId,
          folderId: folderId,
        });
        return newFile;
      })
    );

    return res
      .status(201)
      .json({ message: "Files uploaded successfully", files: newFiles });
  } catch (error) {
    console.error("Error uploading files:", error);

    req.files.forEach((file) => {
      fs.unlinkSync(file.path);
    });

    return res
      .status(500)
      .json({ message: "Failed to upload files", error: error.message });
  }
};

const getAllSupplierPH = async (req, res) => {
  try {
    const supplierPaymentHistory = await SupplierPaymentHistory.findAll();
    return res
      .status(200)
      .json({ supplierPaymentHistory: supplierPaymentHistory });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch files", error: error.message });
  }
};

module.exports = {
  upload: upload.array("files", 10),
  uploadFilesToSupplierPayment: uploadFilesToSupplierPayment,
  getAllSupplierPH,
};
