import express from "express";
import filmController from "../controller/film.controller.js";
import bookingController from "../controller/booking.controller.js";


const router = express.Router();

``
router.post('/save', bookingController.createBooking)
router.get('/get', bookingController.getAllBookings)
router.get('/:id', bookingController.getBookingById)
router.put('/update/:id',bookingController.updateBooking)
router.delete('/delete/:id', bookingController.deleteBooking)





export default router;