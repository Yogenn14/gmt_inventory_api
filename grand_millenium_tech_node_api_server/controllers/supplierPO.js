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
const SupplierQuotation = db.supplierQuotations;
const SupplierPO = db.supplierPOs;

const uploadFilesToSupplierPO = async (req, res) => {
  try {
    const folderId = req.params.folderId;
    const qId = req.params.qId;
    const poNum = req.params.poNum;
    const files = req.files;
    ("");

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    if (!folderId) {
      return res.status(400).json({ message: "Folder ID is required" });
    }
    if (!qId) {
      return res.status(400).json({ message: "Quotation Id is required" });
    }
    if (!poNum) {
      return res.status(400).json({ message: "Po Num is required" });
    }

    const existingQId = await SupplierQuotation.findOne({
      where: { qId: qId },
    });

    if (!existingQId) {
      return res.status(400).json({ message: "This qId cannot be found" });
    }

    const duplicateQId = await SupplierPO.findOne({
      where: { qId: qId },
    });

    if (duplicateQId) {
      return res
        .status(400)
        .json({ message: "This qId has been linked to a PO already." });
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
        const newFile = await SupplierPO.create({
          poId: poNum,
          filename: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
          filePath: file.path,
          qId: qId,
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

const getAllSupplierPO = async (req, res) => {
  try {
    const supplierPO = await SupplierPO.findAll();
    return res.status(200).json({ supplierPO: supplierPO });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch files", error: error.message });
  }
};

module.exports = {
  upload: upload.array("files", 10),
  uploadFilesToSupplierPO: uploadFilesToSupplierPO,
  getAllSupplierPO,
};
