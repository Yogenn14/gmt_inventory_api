const fs = require("fs");
const path = require("path");
const { fillColor, lineGap, fillOpacity } = require("pdfkit");
const PDFDocument = require("pdfkit-table");

function generatePoPdf(poDatas, outputPath, callback) {
  const doc = new PDFDocument();

  const poData = {
    poNumber: `${poDatas.poNumber}`,
    date: `${poDatas.date}`,
    shipToAddress: `
    ${poDatas.shipToAddressLine1}

    ${poDatas.shipToAddressLine2},

    ${poDatas.shipToAddressLine3}
    
    

    

    Tel : ${poDatas.tel}
    
    Email : ${poDatas.email}
    
    Attn : ${poDatas.attn}`,

    incoterm: `    Inco Term: Delivered At Place, Sungai Petani, 
                      Kedah,Malaysia`,

    deliveryDate: "As required",
    notes:
      "2) Vendor guarantees that the goods is free from defect and is fit for its intended use.\n3) Grand Millennium Technology reserves the right to reject any job done that does not meet Grand Millennium Technology's expectations.\nThis is a computer generated Purchase Order. No signature is required.",
    vendorAddress: `
      ${poDatas.vendorAddressLine1},

      ${poDatas.vendorAddressLine2},

      ${poDatas.vendorAddressLine3},

      ${poDatas.vendorAddressLine4},

       

      Tel : ${poDatas.vendorTel}

      Email : ${poDatas.vendorEmail}

      Attn :  ${poDatas.vendorAttn}`,

    buyerDetails: `
      Buyer : ${poDatas.buyer}
      Email : ${poDatas.buyerEmail}
      Tel : ${poDatas.buyerTel}
      `,

    requesterDetails: `
      Requester : ${poDatas.requester}
      Email : ${poDatas.requesterEmail}
      Tel : ${poDatas.requesterTel}
      `,

    supervisorDetails: `
      Supervisor : ${poDatas.supervisor}
      Email : ${poDatas.supervisorEmail}
      Tel : ${poDatas.supervisorTel}
      `,

    paymentTerm: `
    Payment Term: 100% of Prepayment Before Shipping
    `,

    incoTerm: `
    Incoterm: Delivered At Place, Sungai Petani Kedah, Malaysia
    `,

    shipVia: `
    Ship Via: `,
  };

  const logoPath = path.join(__dirname, "../public/logo.png");
  const backgroundImage = path.join(__dirname, "../public/logo.png");

  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  doc.image(logoPath, 50, 15, { width: 90, height: 90 });

  const companyAddressLines = [
    "GRAND MILLENNIUM TECHNOLOGY SDN.BHD (1518495-W)",
    "198, Jalan Batik 2/1A, Taman Batik, 08000 Sungai Petani, Kedah, Malaysia",
    "TEL : +6044411717 / +60125599032 / +60125599081",
    "Email: alex@grandmtech.com / than@grandmtech.com",
    "Website: www.grandmtech.com",
  ];

  let y = 30;
  companyAddressLines.forEach((line, index) => {
    const style = {
      fontSize: index === 0 ? 11 : 9,
      font: index === 0 ? "Helvetica-Bold" : "Helvetica",
      color: "black",
    };
    doc
      .fontSize(style.fontSize)
      .font(style.font)
      .fillColor(style.color)
      .text(line, 105, y, { width: 400, align: "center" });
    y += 15;
  });

  y = 30;
  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .text(`Purchase Order`, 500, y, { width: 100 });
  y += 20;
  doc
    .fontSize(9)
    .font("Helvetica")
    .text(`PO NO : ${poData.poNumber}`, 500, y, { width: 100 });
  y += 20;
  doc
    .fontSize(9)
    .font("Helvetica")
    .text(`Date: ${poData.date}`, 500, y, { width: 100 });
  y += 20;
  doc
    .fontSize(9)
    .font("Helvetica")
    .text(`Page : 1 of 1`, 500, y, { width: 100 });

  doc.text(``, 70, 130);

  doc.lineWidth(0.1);
  doc.lineCap("butt").moveTo(275, 127).lineTo(275, 310).stroke();
  doc.lineCap("butt").moveTo(275, 322).lineTo(275, 471).stroke();

  const tableAddress = {
    headers: [
      {
        label: "Vendor Address",
        headerColor: "#0020C2",
      },
      {
        label: "Ship To Address",
        headerColor: "#0020C2",
      },
    ],
    rows: [[poData.vendorAddress, poData.shipToAddress]],
    x: -100,
    y: y + 50,
    width: 500,
    margin: { top: 30, bottom: 10 },
    styles: {
      fontSize: 9,
      font: "Helvetica",
      lineColor: "white",
      lineWidth: 0.5,
    },
    headerStyles: {
      fillColor: "#8EA9DB",
      fontSize: 10,
      font: "Helvetica-Bold",
      lineColor: "black",
      lineWidth: 0.5,
    },
    columnStyles: {
      0: { width: 250 },
      1: { width: 250 },
    },
    lineGap: 10,
  };

  doc.table(tableAddress, {
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
    prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
      doc.font("Helvetica").fontSize(8);
    },
  });

  const paymentFirstColumn = `${poData.paymentTerm}\n${poData.incoterm}\n${poData.shipVia}`;

  const paymentSecondColumn = `${poData.buyerDetails}\n${poData.requesterDetails}\n${poData.supervisorDetails}`;

  const tablePayment = {
    headers: [
      {
        label: "",
        headerColor: "",
      },
      {
        label: "",
        headerColor: "",
      },
    ],
    rows: [[paymentFirstColumn, paymentSecondColumn]],
    x: -100,
    y: y + 50,
    width: 500,
    margin: { top: 30, bottom: 10 },
    styles: {
      fontSize: 9,
      font: "Helvetica",
      lineColor: "white",
      lineWidth: 0.5,
    },
    headerStyles: {
      fillColor: "#8EA9DB",
      fontSize: 10,
      font: "Helvetica-Bold",
      lineColor: "black",
      lineWidth: 0.5,
    },
    columnStyles: {
      0: { width: 250 },
      1: { width: 250 },
    },
    lineGap: 10,
  };

  doc.table(tablePayment, {
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
    prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
      doc.font("Helvetica").fontSize(8);
    },
  });

  doc.text(`All prices on this order are expressed in : USD`, {
    align: "center",
  });

  doc.moveDown(1);

  const totalAmount = poDatas.items.reduce(
    (total, item) => total + parseFloat(item.amount),
    0
  );

  const poItems = poDatas.items.map((item, index) => [
    `${item.partNo}${item.description}`,
    item.quantity,
    item.uom,
    item.unitPrice,
    item.amount,
  ]);

  const table = {
    headers: [
      {
        label: "Part No/Desc",
        property: "name",
        headerColor: "#0020C2",
      },
      {
        label: "Quantity",
        property: "quantity",
        headerColor: "#0020C2",
      },
      {
        label: "UOM",
        property: "uom",
        headerColor: "#0020C2",
      },
      {
        label: "Unit Price",
        property: "unitPrice",
        headerColor: "#0020C2",
      },
      {
        label: "Amount",
        property: "amount",
        headerColor: "#0020C2",
      },
    ],

    rows: poItems,

    x: -100,
    y: y + 50,
    width: 500,
    margin: { top: 30, bottom: 10 },
    styles: {
      fontSize: 10,
      font: "Helvetica",
      lineColor: "black",
      lineWidth: 0.5,
    },
    headerStyles: {
      fillColor: "#8EA9DB",
      fontSize: 10,
      font: "Helvetica-Bold",
      lineColor: "black",
      lineWidth: 0.5,
    },
    columnStyles: {
      0: { width: 100 },
      1: { width: 150 },
      2: { width: 60, align: "right" },
      3: { width: 60, align: "right" },
      4: { width: 80, align: "right" },
      5: { width: 80, align: "right" },
    },

    lineGap: 10,
  };

  doc.table(table, {
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
    columnsSize: [180, 70, 70, 70, 70],
    prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
      doc.font("Helvetica").fontSize(8);
    },
  });

  // Add TOTAL row
  const totalTable = {
    headers: [
      {
        label: "",
        property: "name",
      },
    ],
    rows: [[`TOTAL: USD ${totalAmount.toFixed(2)}`]],
    x: -100,
    y: y + 50,
    width: 500,
    margin: { top: 30, bottom: 10 },
    styles: {
      fontSize: 10,
      font: "Helvetica-Bold",
      lineColor: "black",
      lineWidth: 0.5,
    },
    headerStyles: {},
    columnStyles: {
      0: { width: 100, align: "left" },
    },
    lineGap: 10,
  };

  doc.table(totalTable, {
    prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
      doc.font("Helvetica-Bold").fontSize(8);
    },
  });

  doc.font("Helvetica").fontSize(7);
  doc.moveDown(1);

  doc.text(`Notes: This offer to purchase is referenced to the price stated in vendor's quotation: ${poDatas.quotationNumber} date ${poDatas.quotationDate} and subjected to the following
condition:-`);
  doc.moveDown(1);

  doc.text(`1)Vendor agrees to deliver the product within the requested date and any acceptance of delivery beyond the requested date shall be at the sole
discretion of Grand Millennium Technology`);
  doc.moveDown(1);

  doc.text(
    `2)Vendor guarantees that the goods is free from defect and is fit for its intended use`
  );
  doc.moveDown(1);

  doc.text(
    `3)Grand Millennium Technology maintains the right to reject any job done that does not meet Grand Millennium Technology's expectations.`
  );
  doc.moveDown(1);

  doc.text(`This is a computer generated Purchase Order. No signature is required.
`);

  const rectangle = { x: 50, y: 100, width: 550, height: 550 };

  // Draw the rectangle with fill and stroke
  doc
    .rect(rectangle.x, rectangle.y, rectangle.width, rectangle.height)
    .fillOpacity(0.07) // Adjust the opacity of the rectangle
    .fill("#FFFFFF") // Fill color of the rectangle; replace with your desired color
    .stroke(); // Draw the outline of the rectangle

  // Draw the image inside the rectangle
  doc.image(logoPath, rectangle.x, rectangle.y, {
    width: rectangle.width,
    height: rectangle.height,
    align: "center",
    valign: "center",
  });

  doc.fillOpacity(1); // Reset fill opacity to 1 (fully opaque)
  doc.fill(); // Reset fill color
  doc.stroke(); // Reset stroke settings
  // Finalize PDF
  doc.end();

  // Call the callback when done
  writeStream.on("finish", callback);
}

function generatePdfController(req, res) {
  const poDatas = req.body;

  const pdfDir = path.join(__dirname, "../public/files"); // Directory to save the generated PDF
  if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir, { recursive: true });
  }
  const pdfPath = path.join(pdfDir, "generated-po.pdf"); // Path to save the generated PDF

  try {
    generatePoPdf(poDatas, pdfPath, () => {
      res.download(pdfPath, "generated-po.pdf", (err) => {
        if (err) {
          console.error("Error sending PDF:", err);
          res.status(500).send({ message: "Error sending PDF" });
        } else {
          // Optionally, delete the PDF file after sending
          fs.unlinkSync(pdfPath);
        }
      });
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    res
      .status(500)
      .send({ message: "Error generating PDF", error: error.message });
  }
}

module.exports = { generatePdfController };
