import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import Order from "../models/Order.js";
import { generateInvoiceNumber } from "../utils/invoice.util.js";

export const downloadInvoice = async (req, res) => {
  try {
    // 1️⃣ Fetch order
    const order = await Order.findById(req.params.orderId)
      .populate("user")
      .populate("items.product");

    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found" });
    }

    // 2️⃣ Generate invoice number once
    if (!order.invoiceNumber) {
      order.invoiceNumber = generateInvoiceNumber(order._id);
      await order.save();
    }

    // 3️⃣ Setup PDF
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=${order.invoiceNumber}.pdf`
    );

    doc.pipe(res);

    /* ================= LOGO ================= */
    const logoPath = path.join(
      process.cwd(),
      "assets",
      "logo.png"
    );

    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, {
        width: 90,
        align: "left",
      });
    }

    /* ================= HEADER ================= */
    doc
      .fontSize(22)
      .text("INVOICE", {
        align: "right",
      });

    doc.moveDown(1);

    doc.fontSize(11);
    doc.text(`Invoice No: ${order.invoiceNumber}`);
    doc.text(`Order ID: ${order._id}`);
    doc.text(
      `Date: ${order.createdAt.toDateString()}`
    );

    doc.moveDown();

    /* ================= BILL TO ================= */
    if (order.shippingAddress) {
      doc.fontSize(12).text("Bill To:");
      doc
        .fontSize(11)
        .text(order.shippingAddress.name || "")
        .text(order.shippingAddress.phone || "")
        .text(order.shippingAddress.address || "");

      doc.moveDown();
    }

    /* ================= ITEMS ================= */
    doc.fontSize(12).text("Items");
    doc.moveDown(0.5);

    // table header
    doc.fontSize(11);
    doc.text("Product", 50, doc.y, {
      continued: true,
    });
    doc.text("Qty", 300, doc.y, {
      continued: true,
    });
    doc.text("Price", 360, doc.y, {
      align: "right",
    });

    doc.moveDown(0.5);
    doc
      .strokeColor("#cccccc")
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke();

    doc.moveDown(0.5);

    order.items.forEach((item) => {
      const title =
        item.product?.title || "Product";
      const qty = item.qty || 1;
      const price = item.price || 0;

      doc.text(title, 50, doc.y, {
        continued: true,
      });
      doc.text(`${qty}`, 300, doc.y, {
        continued: true,
      });
      doc.text(`Tk ${price}`, 360, doc.y, {
        align: "right",
      });

      doc.moveDown(0.5);
    });

    doc.moveDown();

    /* ================= TOTAL ================= */
    doc
      .fontSize(13)
      .text(
        `Total Amount: Tk ${order.totalAmount}`,
        { align: "right" }
      );

    doc.moveDown();

    /* ================= PAYMENT ================= */
    doc.fontSize(11);
    doc.text("Payment Method: Cash on Delivery");
    doc.text(
      `Payment Status: ${
        order.paymentStatus === "paid"
          ? "Paid"
          : "Pay on Delivery"
      }`
    );

    /* ================= FOOTER ================= */
    doc.moveDown(2);
    doc
      .strokeColor("#dddddd")
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke();

    doc.moveDown(1);

    doc
      .fontSize(10)
      .fillColor("gray")
      .text(
        "Thank you for shopping with us!",
        { align: "center" }
      );

    doc.moveDown(0.3);

    doc.text(
      "This is a system generated invoice. No signature required.",
      { align: "center" }
    );

    doc.moveDown(0.3);

    doc.text(
      "For any queries, contact: support@yourshop.com",
      { align: "center" }
    );

    doc.end();
  } catch (error) {
    console.error("Invoice error:", error);
    res.status(500).json({
      message: "Failed to generate invoice",
    });
  }
};
