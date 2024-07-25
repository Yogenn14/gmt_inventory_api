const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

var corsOptions = {
  origin: "*",
};

// middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.json({ message: "Grand Millenium Tech API Server" });
});

app.get("/pdf/:filename", (req, res) => {
  const { filename } = req.params;
  res.setHeader("Content-Disposition", "inline");
  res.sendFile(filename, { root: "./pdf" });
});

const productRouter = require("./routes/productRouter");
const userRouter = require("./routes/userRouter");
const folderRouter = require("./routes/folderRouter");
const fileRouter = require("./routes/fileRouter");
const supplierRouter = require("./routes/supplierRouter");
const inventoryRouter = require("./routes/inventoryRouter");
const poRouter = require("./routes/poRouter");

app.use("/api/products", productRouter);
app.use("/api/user", userRouter);
app.use("/api/folder", folderRouter);
app.use("/api/files", fileRouter);
app.use("/api/supplier", supplierRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/po", poRouter);

const PORT = process.env.PORT || 8083;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
