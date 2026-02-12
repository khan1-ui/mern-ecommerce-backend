import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import Order from "../models/Order.js";
import { generateInvoiceNumber } from "../utils/invoice.util.js";

export const downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("user")
      .populate("store")
      .populate("items.product");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // 🔐 Ownership / Role Check
    const isOwner =
      order.user._id.toString() ===
      req.user._id.toString();

    const isStoreOwner =
      req.user.store &&
      order.store._id.toString() ===
        req.user.store._id.toString();

    const isSuperAdmin =
      req.user.role === "superadmin";

    if (!isOwner && !isStoreOwner && !isSuperAdmin) {
      return res.status(403).json({
        message: "Not authorized to view this invoice",
      });
    }

    // 🔒 Prevent invoice for unpaid order
    if (order.paymentStatus !== "paid") {
      return res.status(400).json({
        message: "Invoice available only for paid orders",
      });
    }

    // 🔢 Generate invoice number if missing
    if (!order.invoiceNumber) {
      order.invoiceNumber =
        generateInvoiceNumber(order._id);
      await order.save();
    }

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

    /* ================= HEADER ================= */
    doc
      .fontSize(22)
      .text("INVOICE", { align: "right" });

    doc.moveDown(1);

    doc.fontSize(11);
    doc.text(`Invoice No: ${order.invoiceNumber}`);
    doc.text(`Order ID: ${order._id}`);
    doc.text(
      `Date: ${order.createdAt.toDateString()}`
    );

    doc.moveDown();

    /* ================= STORE INFO ================= */
    doc.fontSize(12).text("Store:");
    doc.fontSize(11).text(order.store.name);

    doc.moveDown();

    /* ================= BILL TO ================= */
    if (order.shippingAddress) {
      doc.fontSize(12).text("Bill To:");
      doc
        .fontSize(11)
        .text(order.shippingAddress.name || "")
        .text(order.shippingAddress.phone || "")
        .text(order.shippingAddress.address || "")
        .text(order.shippingAddress.city || "");

      doc.moveDown();
    }

    /* ================= ITEMS ================= */
    doc.fontSize(12).text("Items");
    doc.moveDown(0.5);

    order.items.forEach((item) => {
      const title =
        item.product?.title || item.name;
      const qty = item.quantity || 1;
      const price = item.price || 0;

      doc
        .fontSize(11)
        .text(
          `${title} | Qty: ${qty} | Tk ${price}`
        );

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

    /* ================= FOOTER ================= */
    doc
      .fontSize(10)
      .fillColor("gray")
      .text(
        "Thank you for shopping with us!",
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
