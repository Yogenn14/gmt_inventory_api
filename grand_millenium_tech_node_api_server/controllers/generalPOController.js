const response = require("express");
const db = require("../models");

const GeneralPOModel = db.generalPO;

const getPOById = async (req, res) => {
  try {
    const po = await GeneralPOModel.findOne({ where: { id: 1 } });
    if (!po) {
      return res.status(404).json({ message: "PO not found" });
    }
    return res.status(200).json(po);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving PO", error });
  }
};

const updatePOById = async (req, res) => {
  try {
    const [updated] = await GeneralPOModel.update(req.body, {
      where: { id: 1 },
    });

    if (updated) {
      const updatedPO = await GeneralPOModel.findOne({ where: { id: 1 } });
      return res
        .status(200)
        .json({ message: "PO updated successfully", updatedPO });
    }

    return res.status(404).json({ message: "PO not found" });
  } catch (error) {
    return res.status(500).json({ message: "Error updating PO", error });
  }
};

const createPOData = async (req, res) => {
  try {
    const newPO = await GeneralPOModel.create(req.body);
    return res.status(201).json({ message: "PO created successfully", newPO });
  } catch (error) {
    return res.status(500).json({ message: "Error creating PO", error });
  }
};

module.exports = {
  createPOData,
  updatePOById,
  getPOById,
};
