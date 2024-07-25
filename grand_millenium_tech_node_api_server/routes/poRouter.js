const express = require("express");
const router = express.Router();
const poController = require("../controllers/poController");
const generalPOController = require("../controllers/generalPOController");

router.post("/generate-po", poController.generatePdfController);

router.get("/getPO", generalPOController.getPOById);
router.post("/createPOData", generalPOController.createPOData);
router.put("/updatePObyID/:id", generalPOController.updatePOById);

module.exports = router;
