const supplierQuotationController = require("../controllers/supplierQuotationController");
const supplerPOController = require("../controllers/supplierPO");
const supplierInvoiceController = require("../controllers/supplierInvoiceController");
const supplierPaymentHController = require("../controllers/supplierPaymentController");
const salesController = require("../controllers/salesController");
const router = require("express").Router();

//post
//supplier quotation
router.post(
  "/quotation/upload/:qId/:folderId",
  supplierQuotationController.upload,
  supplierQuotationController.uploadFilesToSupplierQ
);

//supplier po
router.post(
  "/po/upload/:qId/:folderId/:poNum",
  supplerPOController.upload,
  supplerPOController.uploadFilesToSupplierPO
);

//supplier invoice
router.post(
  "/invoice/upload/:poId/:folderId/:invoiceId",
  supplierInvoiceController.upload,
  supplierInvoiceController.uploadFilesToSupplierInvoice
);

//supplier payment history
router.post(
  "/paymentHistory/upload/:invoiceId/:folderId/:phId",
  supplierPaymentHController.upload,
  supplierPaymentHController.uploadFilesToSupplierPayment
);

//get
//supplier
router.get(
  "/quotation/getAll",
  supplierQuotationController.getAllSupplierQuotation
);
router.get("/po/getAll", supplerPOController.getAllSupplierPO);
router.get("/invoice/getAll", supplierInvoiceController.getAllSupplierInvoice);
router.get(
  "/paymentHistory/getAll",
  supplierPaymentHController.getAllSupplierPH
);
router.get("/getAllSales", salesController.getAllSupplierSales);
module.exports = router;
