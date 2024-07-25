const fileController = require("../controllers/fileController");

const router = require("express").Router();

router.post(
  "/upload/:folderId",
  fileController.upload,
  fileController.uploadFiles
);

module.exports = router;
