const { checkToken } = require("../auth/token_validation");
const userController = require("../controllers/userController");
const authenticateToken = require("../middleware/authenticateToken");
const { use } = require("./productRouter");
const router = require("express").Router();
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/profileImg");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

//endpoint(/api/products)
router.post("/addUser", userController.addUser);

router.post("/login", userController.login);

router.get("/userdata", authenticateToken, userController.getUserByToken);

router.put("/edit/:email", userController.editUser);

router.post("/refreshToken", userController.refreshToken);
router.post(
  "/uploadProfilePhoto/:email",
  upload.single("profileImage"),
  userController.uploadProfilePhoto
);

module.exports = router;
