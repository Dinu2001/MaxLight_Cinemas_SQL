import express from "express";
import filmController from "../controller/film.controller.js";
import bookingController from "../controller/booking.controller.js";


const router = express.Router();

``
router.post('/', bookingController.createBooking)
router.get('/', bookingController.getAllBookings)
router.get('/:id', bookingController.getBookingById)
router.put('/:id',bookingController.updateBooking)
router.delete('/:id', bookingController.deleteBooking)





export default router;