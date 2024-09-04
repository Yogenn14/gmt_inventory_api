const inventoryController = require("../controllers/inventoryController");
const router = require("express").Router();
const { validateItems } = require("../controllers/inventoryController");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/inventory");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

//[GET]
router.get("/getInventory", inventoryController.getInventoryPaginated);

//[POST]
router.post("/addInventoryItem", inventoryController.addToInventory);

router.post(
  "/addSerializedItem/:id",
  upload.single("image"),
  inventoryController.addSerializedPart
);

router.get("/search", inventoryController.searchInventory);

router.put(
  "/updateSerializedItemOut",
  inventoryController.updateSerializedItemOut
);

router.post(
  "/addUnserializedItem/:id",
  upload.single("image"),
  inventoryController.addUnserializedItem
);

router.post("/shipOutUnserialized/:id", inventoryController.shipOutItems);

router.delete(
  "/revertShippedOutUnserialized/:unserializedOutId",
  inventoryController.revertShipment
);

router.post("/validatePNPD", inventoryController.validatePNPD);
router.post("/validate-items", validateItems);

router.post("/bulkAddInv", inventoryController.bulkAddItems);
router.post("/addConstraint", inventoryController.addConstraint);

//edit/
router.put(
  "/editSerialized/:id/:serialId",
  inventoryController.updateSerializedPart
);

router.put(
  "/editUnserialized/:id/:unserialId",
  inventoryController.editUnserializedItem
);

router.put(
  "/editShippedOut/:unserializedOutId",
  inventoryController.updateUnserializedOutEntry
);

router.put(
  "/unserializedin/:id/image",
  upload.single("image"),
  inventoryController.updateUnserializedItemImage
);

router.put(
  "/serialized/:id/image",
  upload.single("image"),
  inventoryController.updateSerializedItemImage
);

module.exports = router;
