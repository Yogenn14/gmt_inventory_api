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
const SupplierPO = db.supplierPOs;

const uploadFilesToSupplierInvoice = async (req, res) => {
  try {
    const folderId = req.params.folderId;
    const poId = req.params.poId;
    const invoiceId = req.params.invoiceId;
    const files = req.files;
    ("");

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    if (!folderId) {
      return res.status(400).json({ message: "Folder ID is required" });
    }
    if (!poId) {
      return res
        .status(400)
        .json({ message: "Purchase Order (PO) Id is required" });
    }
    if (!invoiceId) {
      return res.status(400).json({ message: "Invoice Id is required" });
    }

    const existingPOid = await SupplierPO.findOne({
      where: { poId: poId },
    });

    if (!existingPOid) {
      return res.status(400).json({ message: "This PO ID cannot be found" });
    }

    const duplicatePoId = await SupplierInvoice.findOne({
      where: { poId: poId },
    });

    if (duplicatePoId) {
      return res
        .status(400)
        .json({ message: "This PO Id has been linked to a Invoice already." });
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
        const newFile = await SupplierInvoice.create({
          invoiceId: invoiceId,
          filename: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
          filePath: file.path,
          poId: poId,
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

const getAllSupplierInvoice = async (req, res) => {
  try {
    const supplierInvoice = await SupplierInvoice.findAll();
    return res.status(200).json({ supplierInvoice: supplierInvoice });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch files", error: error.message });
  }
};

module.exports = {
  upload: upload.array("files", 10),
  uploadFilesToSupplierInvoice: uploadFilesToSupplierInvoice,
  getAllSupplierInvoice,
};
