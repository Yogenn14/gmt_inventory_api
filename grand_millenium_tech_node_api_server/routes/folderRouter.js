const folderController = require("../controllers/folderController");

const router = require("express").Router();

router.get("/getRootFolders", folderController.getRootFolders);
router.post("/createFolder", folderController.createFolder);
router.get("/getFolders", folderController.getFolders);
router.get("/getAllFoldersPaginated", folderController.getAllFoldersPaginated);
router.get(
  "/getAllSubFolderandFile/:id",
  folderController.getAllFilesAndSubfolders
);

module.exports = router;
