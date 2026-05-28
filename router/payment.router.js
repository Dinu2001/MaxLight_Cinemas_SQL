import express from "express";
import paymentController from "../controller/payment.controller.js";





const router = express.Router();


router.post('/',paymentController.savePayment);






export default router;