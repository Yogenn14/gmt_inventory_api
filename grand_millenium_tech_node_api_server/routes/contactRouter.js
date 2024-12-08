const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactDatabaseController");

router.post("/contacts", contactController.createContact);
router.get("/contacts", contactController.getAllContacts);
router.get("/contacts/:id", contactController.getContactById);
router.put("/contacts/:id", contactController.updateContact);
router.delete("/contacts/:id", contactController.deleteContact);
router.get("/category", contactController.getAllCategories)

module.exports = router;
