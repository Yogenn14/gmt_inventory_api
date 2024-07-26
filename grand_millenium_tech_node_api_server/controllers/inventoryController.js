const { response } = require("express");
const db = require("../models");
const { sign } = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { verify } = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { off } = require("process");
const { Op, where } = require("sequelize");
const { sequelize } = db;
const createNotification = require("../services/emailServices");
const { validateSchema } = require("../middleware/validationSchema");
const { validate } = require("uuid");

const Inventory = db.inventory;
const InventoryLog = db.inventoryLog;
const User = db.users;
const UnserializedIn = db.unserializedIn;
const UnserializedOut = db.unserializedOut;
const SerializedItem = db.serializedItem;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/inventory");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload an image."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

const getInventoryPaginated = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const partNum = req.query.partNum || "";
    const type = req.query.type || "";
    const partDescription = req.query.partDescription || "";

    const searchCondition = {
      ...(partNum && {
        partNumber: { [Op.like]: `%${partNum}%` },
      }),
      ...(type && {
        type: type,
      }),
      ...(partDescription && {
        partDescription: partDescription,
      }),
    };

    const { count, rows } = await Inventory.findAndCountAll({
      where: searchCondition,
      limit,
      offset,
      include: [
        {
          model: SerializedItem,
          as: "serializedItems",
          required: false,
          include: {
            model: User,
            as: "user",
            attributes: ["name", "image"],
          },
        },
        {
          model: UnserializedIn,
          as: "unserializedIn",
          required: false,
          include: {
            model: UnserializedOut,
            as: "unserializedOut",
          },
        },
        {
          model: User,
          as: "user",
          attributes: ["name", "image"],
          required: false,
        },
      ],
    });

    const totalItems = await Inventory.count();

    let totalParts = totalItems;
    rows.forEach((item) => {
      if (item.type === "serialized" && item.serializedItems) {
        totalParts += item.serializedItems.length - 1;
      }
    });

    const totalPages = Math.ceil(totalItems / limit);

    const paginatedResults = {
      totalItems,
      totalParts,
      totalPages,
      currentPage: page,
      items: rows,
    };

    res.json(paginatedResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const searchInventory = async (req, res) => {
  try {
    const partNum = req.query.partNum || "";
    const partDesc = req.query.partDescription || "";
    const type = req.query.type || "";

    const searchCondition = {
      ...(partNum && {
        partNumber: { [Op.like]: `%${partNum}%` },
      }),
      ...(partDesc && {
        partDescription: { [Op.like]: `%${partDesc}%` },
      }),
      ...(type && {
        type: type,
      }),
    };

    const rows = await Inventory.findAll({
      where: searchCondition,
      attributes: ["partNumber", "partDescription", "id"],
      limit: 5,
    });

    const searchResults = rows.map((item) => item.toJSON());

    res.json(searchResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addToInventory = async (req, res) => {
  try {
    const {
      partDescription,
      partNumber,
      quantity,
      manufactureroem,
      type,
      condition,
      image,
      status,
      inDate,
      outDate,
      userEmail,
      supplier,
    } = req.body;

    const queryConditions = {};
    if (partNumber) queryConditions.partNumber = partNumber;
    if (partDescription) queryConditions.partDescription = partDescription;

    const existingItem = await Inventory.findOne({
      where: queryConditions,
    });

    if (existingItem) {
      return res.status(400).json({
        error:
          "An item with the same Part Number and Part Description combination already exists in the Database.",
        partNumber: partNumber,
        partDescription: partDescription,
        inventoryId: existingItem.id,
        type: existingItem.type,
      });
    }

    if (type === "serialized") {
      if (
        condition !== "" ||
        manufactureroem !== "" ||
        quantity !== 0 ||
        status !== ""
      ) {
        return res.status(400).json({
          error:
            "Validation error.Add serialized items individually.Manufactureroem, quantity, and status are invalid fields, and quantity must be 0.",
        });
      }
    } else if (type === "non-serialized") {
      if (manufactureroem === "" || quantity === 0 || status === "") {
        return res.status(400).json({
          error:
            "Validation error for non-serialized items(initial purchase). Manufactureroem, quantity, and status are required fields, and quantity must be more than 0.",
        });
      } else if (inDate === null) {
        return res
          .status(400)
          .json({ error: "empty InDate for this non-serialized item" });
      }
    } else {
      return res.status(400).json({
        error:
          "The type field is required and must be either 'serialized' or 'non-serialized'.",
      });
    }

    const formData = {
      partDescription,
      partNumber,
      quantity,
      manufactureroem,
      condition,
      type,
      image,
      status,
      inDate,
      outDate,
      userEmail,
    };

    //console.log("Received formData:", formData);

    const inventory = await Inventory.create(formData);

    if (type === "non-serialized") {
      const unserializedIn = await UnserializedIn.create({
        inventoryId: inventory.id,
        quantityChange: quantity,
        totalPurchased: quantity,
        date: inDate,
        supplier: supplier,
        manufactureroem: manufactureroem,
        condition: condition,
        status: status,
        userEmail: userEmail,
      });
    }

    //mail noti
    const emailSubject = `Beta-GMT Inventory Item Added [Part Number: ${
      partNumber !== null ? partNumber : "unspecified"
    }] [Part Description: ${
      partDescription !== null ? partDescription : "unspecified"
    }]`;
    const emailText = `A new item has been added to the inventory:\n\nPart Description: ${partDescription}\nPart Number: ${partNumber}\nType: ${type}\nQuantity : ${quantity}\nIn Date : ${inDate}\nCreated by: ${userEmail}`;

    if (type === "non-serialized") {
      await createNotification("dhia@grandmtech.com", emailSubject, emailText);
    }

    return res.status(201).json({
      message: "Item added successfully",
      inventory,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const validatePNPD = async (req, res) => {
  const { partNumber, partDescription } = req.body;

  if (!partNumber || !partDescription) {
    return res
      .status(400)
      .json({ error: "Part number and part description are required" });
  }

  try {
    const existingItem = await Inventory.findOne({
      where: {
        partNumber: partNumber,
        partDescription: partDescription,
      },
    });

    if (existingItem) {
      return res.status(200).json({
        error: "Constraint Exist",
        id: `${existingItem.id}`,
        type: `${existingItem.type}`,
      });
    }

    return res
      .status(200)
      .json({ message: "Part number and part description does not exist" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const addUnserializedItem = async (req, res) => {
  const { id } = req.params;
  const inventoryId = id;

  const {
    quantityChange,
    date,
    supplier,
    manufactureroem,
    condition,
    status,
    userEmail,
  } = req.body;

  const transaction = await sequelize.transaction();

  try {
    const findInventoryId = await Inventory.findByPk(id);
    if (!findInventoryId) {
      await transaction.rollback();
      return res.status(400).json({ error: "Cannot find this inventoryID" });
    }

    const partDetails = {
      partNumber: findInventoryId.partNumber,
      partDescription: findInventoryId.partDescription,
    };

    if (
      quantityChange <= 0 ||
      !supplier ||
      !manufactureroem ||
      !condition ||
      !status ||
      !date
    ) {
      await transaction.rollback();
      return res.status(400).json({ error: "Invalid input parameters" });
    }

    const { type } = findInventoryId;

    if (type === "serialized") {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Serialized Item cannot be added into this" });
    }

    await Inventory.update(
      { quantity: findInventoryId.quantity + quantityChange },
      { where: { id: id }, transaction }
    );

    const unserializedIn = await UnserializedIn.create(
      {
        inventoryId: id,
        quantityChange: quantityChange,
        totalPurchased: quantityChange,
        date: date,
        supplier: supplier,
        manufactureroem: manufactureroem,
        condition: condition,
        status: status,
        userEmail: userEmail,
      },
      { transaction }
    );

    await transaction.commit();

    //mail noti
    const emailSubject = `Beta-GMT Inventory [Unserialized] Item Added [Part Number: ${
      partDetails.partNumber !== null ? partDetails.partNumber : "unspecified"
    }] [Part Description: ${
      partDetails.partDescription !== null
        ? partDetails.partDescription
        : "unspecified"
    }]`;
    const emailText = `A new item has been added to the inventory:\n\nPart Description: ${partDetails.partDescription}\nPart Number: ${partDetails.partNumber}\n\nType: ${type}\nQuantity : ${quantityChange}\nIn Date : ${date}\nCreated by: ${userEmail}`;
    await createNotification("dhia@grandmtech.com", emailSubject, emailText);

    return res.status(201).json({
      message: "Successfully created",
      partData: partDetails,
    });
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback();
    return res.status(500).json({ error: "Internal server error" });
  }
};


const shipOutItems = async (req, res) => {
  const { id } = req.params;
  const { shipments } = req.body;

  const transaction = await sequelize.transaction();

  try {
    // Calculate the total quantity requested to be shipped out
    const totalRequestedQuantity = shipments.reduce(
      (total, shipment) => total + shipment.quantity,
      0
    );

    const promises = shipments.map(async (shipment) => {
      const { unserializedInId, quantity, customer, date } = shipment;

      const unserializedInItem = await UnserializedIn.findByPk(
        unserializedInId,
        { transaction }
      );
      if (!unserializedInItem) {
        throw new Error(`UnserializedIn with id ${unserializedInId} not found`);
      }

      if (unserializedInItem.inventoryId !== parseInt(id)) {
        throw new Error(
          `Inventory ID mismatch for UnserializedIn with id ${unserializedInId}`
        );
      }

      // Validate total requested quantity against available quantity
      if (unserializedInItem.quantityChange < totalRequestedQuantity) {
        throw new Error(
          `Not enough quantity available for UnserializedIn with id ${unserializedInId}. Requested: ${totalRequestedQuantity}, Available: ${unserializedInItem.quantityChange}`
        );
      }

      await unserializedInItem.update(
        {
          quantityChange:
            unserializedInItem.quantityChange - totalRequestedQuantity,
        },
        { transaction }
      );

      await UnserializedOut.create(
        {
          unserializedInId,
          customer,
          quantity,
          date,
        },
        { transaction }
      );
    });

    await Promise.all(promises);

    const inventoryItem = await Inventory.findByPk(id, {
      transaction,
    });
    if (!inventoryItem) {
      throw new Error(`Inventory with id ${id} not found`);
    }

    if (inventoryItem.quantity < totalRequestedQuantity) {
      throw new Error(
        `Not enough quantity available in inventory with id ${id}. Requested: ${totalRequestedQuantity}, Available: ${inventoryItem.quantity}`
      );
    }

    await inventoryItem.update(
      { quantity: inventoryItem.quantity - totalRequestedQuantity },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      message: "Items successfully shipped out",
      totalShippedQuantity: totalRequestedQuantity,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    return res.status(500).json({ error: error.message });
  }
};

const revertShipment = async (req, res) => {
  const { unserializedOutId } = req.params;

  const transaction = await sequelize.transaction();

  try {
    const unserializedOutItem = await UnserializedOut.findByPk(
      unserializedOutId,
      { transaction }
    );
    if (!unserializedOutItem) {
      throw new Error(`UnserializedOut with id ${unserializedOutId} not found`);
    }

    const unserializedInItem = await UnserializedIn.findByPk(
      unserializedOutItem.unserializedInId,
      { transaction }
    );
    if (!unserializedInItem) {
      throw new Error(
        `UnserializedIn with id ${unserializedOutItem.unserializedInId} not found`
      );
    }

    await unserializedInItem.update(
      {
        quantityChange:
          unserializedInItem.quantityChange + unserializedOutItem.quantity,
      },
      { transaction }
    );

    const inventoryItem = await Inventory.findByPk(
      unserializedInItem.inventoryId,
      { transaction }
    );
    if (!inventoryItem) {
      throw new Error(
        `Inventory with id ${unserializedInItem.inventoryId} not found`
      );
    }

    await inventoryItem.update(
      { quantity: inventoryItem.quantity + unserializedOutItem.quantity },
      { transaction }
    );

    await unserializedOutItem.destroy({ transaction });

    await transaction.commit();

    return res.status(200).json({
      message: "Shipment successfully reverted",
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    return res.status(500).json({ error: error.message });
  }
};

//add serialized item to inventory -InDate-[item in]
const addSerializedPart = async (req, res) => {
  const { id } = req.params;
  const inventoryId = id;
  const {
    serialNumber,
    quantity,
    condition,
    status,
    manufactureroem,
    inDate,
    outDate,
    userEmail,
    supplier,
    customer,
    warrantyEndDate,
  } = req.body;

  const transaction = await sequelize.transaction();

  const findInventoryId = await Inventory.findByPk(id);
  if (!findInventoryId) {
    await transaction.rollback();
    return res.status(400).json({ error: "Cannot find this inventoryID" });
  }

  if (serialNumber === null || serialNumber === "") {
    return res.status(400).json({ error: "empty serial number" });
  }

  const findSerialNumber = await SerializedItem.findOne({
    where: { serialNumber: serialNumber },
  });

  if (findSerialNumber) {
    await transaction.rollback();
    return res.status(400).json({ error: "Serial Number already exist" });
  }

  const partDetails = {
    partNumber: findInventoryId.partNumber,
    partDescription: findInventoryId.partDescription,
  };

  const { type } = findInventoryId;

  if (type === "non-serialized") {
    await transaction.rollback();

    return res
      .status(400)
      .json({ error: "Non Serialized Item cannot be added into this" });
  }

  if (quantity <= 0) {
    await transaction.rollback();
    return res.status(400).json({ error: "Invalid quantity" });
  }
  if (quantity !== 1) {
    await transaction.rollback();
    return res.status(400).json({ error: "Invalid quantity" });
  }

  if (inDate === null) {
    await transaction.rollback();
    return res.status(400).json({ error: "In Date cannot be null" });
  }

  if (outDate !== null) {
    await transaction.rollback();
    return res.status(400).json({ error: "Item in cannot have outDate" });
  }

  if (new Date(warrantyEndDate) < new Date(inDate)) {
    await transaction.rollback();
    return res.status(400).json({
      error: "Warranty End Date cannot be before the In Date of the unit",
    });
  }

  const body = {
    inventoryId,
    serialNumber,
    quantity,
    condition,
    status,
    manufactureroem,
    inDate,
    outDate,
    userEmail,
    supplier,
    customer,
    warrantyEndDate,
  };

  try {
    await Inventory.update(
      {
        quantity: findInventoryId.quantity + 1,
        totalStock: findInventoryId.totalStock + 1,
      },
      { where: { id: inventoryId }, transaction }
    );
    const serializedItem = await SerializedItem.create(body, { transaction });

    await transaction.commit();

    //mail noti
    const emailSubject = `Beta-GMT Inventory Item Added [Serial Number: ${serialNumber}] [Part Number: ${
      partDetails.partNumber !== null ? partDetails.partNumber : "unspecified"
    }] [Part Description: ${
      partDetails.partDescription !== null
        ? partDetails.partDescription
        : "unspecified"
    }]`;
    const emailText = `A new item has been added to the inventory:\n\nPart Description: ${partDetails.partDescription}\nPart Number: ${partDetails.partNumber}\nSerial Number: ${serialNumber}\nType: ${type}\nQuantity : ${quantity}\nIn Date : ${inDate}\nCreated by: ${userEmail}`;
    await createNotification("dhia@grandmtech.com", emailSubject, emailText);

    return res.status(201).json({
      message: "Successfully created",
      partData: partDetails,
      serializedItem: serializedItem,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    return res.status(500).json({ error: "Internal server error" });
  }
};

//ship out serialized item-[outDate, customer]
const updateSerializedItemOut = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { serialNumbers, outDate, customer, userEmail } = req.body;

    if (!Array.isArray(serialNumbers) || serialNumbers.length === 0) {
      return res
        .status(400)
        .json({ error: "Serial numbers must be a non-empty array" });
    }
    if (!outDate) {
      return res.status(400).json({ error: "Out Date is required" });
    }
    if (!customer) {
      return res.status(400).json({ error: "Customer is required" });
    }

    const serializedItems = await SerializedItem.findAll({
      where: {
        serialNumber: serialNumbers,
      },
      transaction,
    });

    if (serializedItems.length !== serialNumbers.length) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ error: "Some serial numbers were not found" });
    }

    const inventoryIds = new Set(
      serializedItems.map((item) => item.inventoryId)
    );
    if (inventoryIds.size > 1) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Serial numbers must belong to the same inventory" });
    }

    const invalidEntries = serializedItems.some(
      (item) => item.outDate || item.customer
    );
    if (invalidEntries) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Some entries already have an outDate and customer" });
    }

    const inventoryId = Array.from(inventoryIds)[0];

    const [updateCount, updatedItems] = await SerializedItem.update(
      { outDate, customer },
      {
        where: {
          serialNumber: serialNumbers,
        },
        returning: true,
        transaction,
      }
    );

    if (updateCount === 0) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ error: "No matching serialized items found" });
    }

    const inventoryItem = await Inventory.findByPk(inventoryId, {
      transaction,
    });
    await Inventory.update(
      { quantity: inventoryItem.quantity - updatedItems },
      { where: { id: inventoryId }, transaction }
    );

    await transaction.commit();

    const emailSubject = "GMT-Inventory Item Out";
    const emailText = `The following serialized items have been updated with a new Out Date and Customer:\n\nSerial Numbers: ${serialNumbers.join(
      ", "
    )}\nOut Date: ${outDate}\nCustomer: ${customer}\n${userEmail}`;
    await createNotification("dhia@grandmtech.com", emailSubject, emailText);

    return res.status(200).json({
      message: "Serialized items updated successfully",
      updatedItems: updatedItems,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//admin
const revertSerializedItemOut = async (req, res) => {
  try {
    const { serialNumbers } = req.body;

    if (!Array.isArray(serialNumbers) || serialNumbers.length === 0) {
      return res
        .status(400)
        .json({ error: "Serial numbers must be a non-empty array" });
    }

    const serializedItems = await SerializedItem.findAll({
      where: {
        serialNumber: serialNumbers,
      },
    });

    if (serializedItems.length !== serialNumbers.length) {
      return res
        .status(404)
        .json({ error: "Some serial numbers were not found" });
    }

    const [updateCount, updatedItems] = await SerializedItem.update(
      { outDate: null, customer: null },
      {
        where: {
          serialNumber: serialNumbers,
        },
        returning: true,
      }
    );

    if (updateCount === 0) {
      return res
        .status(404)
        .json({ error: "No matching serialized items found" });
    }

    const emailSubject = "[ADMIN]GMT-Inventory Item Reverted";
    const emailText = `The following serialized items have been reverted to remove the Out Date and Customer:\n\nSerial Numbers: ${serialNumbers.join(
      ", "
    )}`;
    await createNotification("andrea@grandmtech.com", emailSubject, emailText);

    return res.status(200).json({
      message: "Serialized items reverted successfully",
      updatedItems: updatedItems,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const validateItems = (req, res) => {
  const { error } = validateSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ error: error.details.map(detail => detail.message).join(', ') });
  }

  res.status(200).json({ message: 'Validation successful' });
};


const bulkAddItems = async (req, res) => {
  const { items } = req.body;
  const transaction = await sequelize.transaction();

  try {
    for (const item of items) {
      const {
        inventoryId,
        type,
        quantityChange,
        date,
        supplier,
        manufactureroem,
        condition,
        status,
        userEmail,
        serialNumber,
        inDate,
        outDate,
        customer,
        warrantyEndDate,
      } = item;

      const findInventoryId = await Inventory.findByPk(inventoryId);
      if (!findInventoryId) {
        throw new Error(`Cannot find inventoryID: ${inventoryId}`);
      }

      const partDetails = {
        partNumber: findInventoryId.partNumber,
        partDescription: findInventoryId.partDescription,
      };

      if (type === "unserialized") {
        if (
          quantityChange <= 0 ||
          !supplier ||
          !manufactureroem ||
          !condition ||
          !status ||
          !date
        ) {
          throw new Error("Invalid input parameters for unserialized item");
        }

        await Inventory.update(
          { quantity: findInventoryId.quantity + quantityChange },
          { where: { id: inventoryId }, transaction }
        );

        await UnserializedIn.create(
          {
            inventoryId,
            quantityChange,
            totalPurchased: quantityChange,
            date,
            supplier,
            manufactureroem,
            condition,
            status,
            userEmail,
          },
          { transaction }
        );
      } else if (type === "serialized") {
        if (
          serialNumber === null ||
          serialNumber === "" ||
          quantityChange !== 1 ||
          !condition ||
          !status ||
          !manufactureroem ||
          !inDate ||
          new Date(warrantyEndDate) < new Date(inDate) ||
          outDate !== null
        ) {
          throw new Error("Invalid input parameters for serialized item");
        }

        const findSerialNumber = await SerializedItem.findOne({
          where: { serialNumber: serialNumber },
        });

        if (findSerialNumber) {
          throw new Error(`Serial Number already exists: ${serialNumber}`);
        }

        await Inventory.update(
          {
            quantity: findInventoryId.quantity + 1,
            totalStock: findInventoryId.totalStock + 1,
          },
          { where: { id: inventoryId }, transaction }
        );

        await SerializedItem.create(
          {
            inventoryId,
            serialNumber,
            quantity: 1,
            condition,
            status,
            manufactureroem,
            inDate,
            outDate,
            userEmail,
            supplier,
            customer,
            warrantyEndDate,
          },
          { transaction }
        );
      }

      // Send notification
      const emailSubject = `Beta-GMT Inventory Item Added [Part Number: ${
        partDetails.partNumber !== null ? partDetails.partNumber : "unspecified"
      }] [Part Description: ${
        partDetails.partDescription !== null
          ? partDetails.partDescription
          : "unspecified"
      }]`;
      const emailText = `A new item has been added to the inventory:\n\nPart Description: ${partDetails.partDescription}\nPart Number: ${partDetails.partNumber}\n${
        type === "serialized" ? `Serial Number: ${serialNumber}\n` : ""
      }Type: ${type}\nQuantity: ${type === "serialized" ? 1 : quantityChange}\nIn Date: ${
        type === "serialized" ? inDate : date
      }\nCreated by: ${userEmail}`;
      await createNotification("dhia@grandmtech.com", emailSubject, emailText);
    }

    await transaction.commit();

    return res.status(201).json({
      message: "Successfully created",
    });
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback();
    return res.status(500).json({ error: "Internal server error", message: error.message });
  }
};



module.exports = {
  getInventoryPaginated,
  addToInventory,
  addSerializedPart,
  searchInventory,
  updateSerializedItemOut,
  revertSerializedItemOut,
  addUnserializedItem,
  shipOutItems,
  revertShipment,
  validatePNPD,
  bulkAddItems,
  validateItems
};
