import express from "express";
import bookingSeatController from "../controller/bookedSeat.controller.js";



const router = express.Router();


router.get('/:filmId/:showtimeId', bookingSeatController.getBookedSeats);

router.delete('/:id', bookingSeatController.cancelBooking);
// router.delete('/user/:id', bookingSeatController.getUserBookings);


export default  router;