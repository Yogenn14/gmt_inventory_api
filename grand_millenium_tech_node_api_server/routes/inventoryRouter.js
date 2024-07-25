const inventoryController = require("../controllers/inventoryController");
const router = require("express").Router();

//[GET]
router.get("/getInventory", inventoryController.getInventoryPaginated);

//[POST]
router.post("/addInventoryItem", inventoryController.addToInventory);

router.post("/addSerializedItem/:id", inventoryController.addSerializedPart);

router.get("/search", inventoryController.searchInventory);

router.put(
  "/updateSerializedItemOut",
  inventoryController.updateSerializedItemOut
);

router.post(
  "/addUnserializedItem/:id",
  inventoryController.addUnserializedItem
);

router.post("/shipOutUnserialized/:id", inventoryController.shipOutItems);

router.delete(
  "/revertShippedOutUnserialized/:unserializedOutId",
  inventoryController.revertShipment
);

router.post("/validatePNPD", inventoryController.validatePNPD);

module.exports = router;