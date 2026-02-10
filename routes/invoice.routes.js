import express from "express";
import { downloadInvoice } from "../controllers/invoice.controller.js";


const router = express.Router();

router.get(
  "/orders/:orderId/invoice",
  downloadInvoice
);


export default router;
