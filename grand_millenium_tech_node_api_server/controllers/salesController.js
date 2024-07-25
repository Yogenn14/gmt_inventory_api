const { response } = require("express");
const db = require("../models");
const mime = require("mime-types");

const supplierQuotation = db.supplierQuotations;
const supplierPO = db.supplierPOs;
const supplierInvoice = db.supplierInvoices;
const supplierPayment = db.supplierPaymentHistorys;

const getAllSupplierSales = async (req, res) => {
  try {
    // Fetch all quotations, POs, invoices, and payment histories
    const allQuotations = await supplierQuotation.findAll();
    const allPOs = await supplierPO.findAll();
    const allInvoices = await supplierInvoice.findAll();
    const allPayments = await supplierPayment.findAll();

    const mappedSales = allQuotations.map((quotation) => {
      const relatedPOs = allPOs.filter((po) => po.qId === quotation.qId);
      const poIds = relatedPOs.map((po) => po.poId);
      const relatedInvoices = allInvoices.filter((invoice) =>
        poIds.includes(invoice.poId)
      );
      const relatedPayments = allPayments.filter((payment) =>
        relatedInvoices.some(
          (invoice) => invoice.invoiceId === payment.invoiceId
        )
      );

      return {
        quotation,
        po: relatedPOs,
        invoice: relatedInvoices,
        paymentHistory: relatedPayments,
      };
    });

    res.json({ success: true, sales: mappedSales });
  } catch (error) {
    console.error("Error fetching sales data:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getAllSupplierSales,
};
