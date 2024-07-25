const { response } = require("express");
const db = require("../models");
const mime = require("mime-types");

const Folder = db.folders;
const File = db.files;
const supplierQuotation = db.supplierQuotations;

const getRootFolders = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const baseURL = process.env.REACT_APP_BASE_URL;

  try {
    const offset = (page - 1) * limit;

    const { rows: rootFolders, count: totalRootFolders } =
      await Folder.findAndCountAll({
        where: { parentFolderId: null },
        limit: limit,
        offset: offset,
        order: [["createdAt", "DESC"]], // Order by creation date in descending order
      });

    const totalPages = Math.ceil(totalRootFolders / limit);

    const response = {
      totalPages: totalPages,
      currentPage: page,
      rootFolders: rootFolders,
    };

    // Send the response
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch root folders", error });
  }
};

// Create Folder
const createFolder = async (req, res) => {
  try {
    const { title, parentFolderId } = req.body;

    if (parentFolderId) {
      const parentFolder = await Folder.findByPk(parentFolderId);
      if (!parentFolder) {
        return res.status(404).json({ message: "Parent folder not found" });
      }
    }

    const folder = await Folder.create({ title, parentFolderId });
    res.status(201).json(folder);
  } catch (error) {
    res.status(500).json({ message: "Folder creation failed", error });
  }
};

const mapSubfolders = (folders, parentId = null) => {
  return folders
    .filter((folder) => folder.parentFolderId === parentId)
    .map((folder) => ({
      ...folder.toJSON(),
      subfolders: mapSubfolders(folders, folder.id),
    }));
};

// Get Folders
const getFolders = async (req, res) => {
  try {
    const allFolders = await Folder.findAll();

    const rootFolders = mapSubfolders(allFolders);

    res.status(200).json(rootFolders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch folders", error });
  }
};

const getAllFoldersPaginated = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;

  try {
    const offset = (page - 1) * limit;

    const folders = await Folder.findAndCountAll({
      order: [["createdAt", "DESC"]],
      limit: limit,
      offset: offset,
    });

    const paginatedFolders = mapSubfolders(folders.rows);

    const totalPages = Math.ceil(folders.count / limit);

    const response = {
      totalPages: totalPages,
      currentPage: page,
      folders: paginatedFolders,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch folders", error });
  }
};

const updateFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, parentFolderId } = req.body;
    const folder = await Folder.findByPk(id);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }
    await folder.update({ title, parentFolderId });
    res.status(200).json(folder);
  } catch (error) {
    res.status(500).json({ message: "Failed to update folder", error });
  }
};

const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const folder = await Folder.findByPk(id);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }
    await folder.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete folder", error });
  }
};

const getAllFilesAndSubfolders = async (req, res) => {
  const { id } = req.params;

  try {
    const subfolders = await Folder.findAll({ where: { parentFolderId: id } });
    const folder = await Folder.findOne({ where: { id: id } });

    const getParentFolderUrl = async (folderId, path = "") => {
      if (!folderId) {
        return path;
      } else {
        const parentFolder = await Folder.findOne({ where: { id: folderId } });
        const parentFolderTitle = parentFolder.title;
        path = `${parentFolderTitle}/${path}`;
        return getParentFolderUrl(parentFolder.parentFolderId, path);
      }
    };

    const path = await getParentFolderUrl(folder.parentFolderId);
    const folderTitle = folder.title;
    const files = await File.findAll({ where: { folderId: id } });
    const supplierQuotation = await db.supplierQuotations.findAll({
      where: { folderId: id },
    });
    const supplierPO = await db.supplierPOs.findAll({
      where: { folderId: id },
    });
    const supplierInvoice = await db.supplierInvoices.findAll({
      where: { folderId: id },
    });
    const supplierPaymentHistorys = await db.supplierPaymentHistorys.findAll({
      where: { folderId: id },
    });

    const fileExtensions = files.map((file) => {
      const fileType = file.fileType;
      const extension = mime.extension(fileType);
      return extension ? `.${extension}` : "";
    });

    const quotationfileExtensions = supplierQuotation.map(
      (supplierQuotation) => {
        const quotationType = supplierQuotation.fileType;
        const extension = mime.extension(quotationType);
        return extension ? `.${extension}` : "";
      }
    );

    const pofileExtensions = supplierPO.map((supplierPO) => {
      const poType = supplierPO.fileType;
      const extension = mime.extension(poType);
      return extension ? `.${extension}` : "";
    });

    const invoiceExtensions = supplierInvoice.map((supplierInvoice) => {
      const invoiceType = supplierInvoice.fileType;
      const extension = mime.extension(invoiceType);
      return extension ? `.${extension}` : "";
    });

    const paymentHistoryExtensions = supplierPaymentHistorys.map(
      (supplierPaymentHistorys) => {
        const paymentHistoryExtensions = supplierPaymentHistorys.fileType;
        const extension = mime.extension(paymentHistoryExtensions);
        return extension ? `.${extension}` : "";
      }
    );

    const response = {
      folderId: id,
      folderTitle: folderTitle,
      path: path,
      subfolders: subfolders,
      files: files,
      supplierQuotation: supplierQuotation,
      supplierPO: supplierPO,
      supplierInvoice: supplierInvoice,
      supplierPaymentHistorys: supplierPaymentHistorys,
      fileExtensions: fileExtensions,
      quotationfileExtensions: quotationfileExtensions,
      poExtentions: pofileExtensions,
      invoiceExtensions: invoiceExtensions,
      paymentHistoryExtensions: paymentHistoryExtensions,
    };

    // Send the response
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to fetch files and subfolders", error });
  }
};

module.exports = {
  createFolder,
  getFolders,
  updateFolder,
  deleteFolder,
  getAllFoldersPaginated,
  getRootFolders,
  getAllFilesAndSubfolders,
};
