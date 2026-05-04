
import express from "express";
import seatController from "../controller/seat.controller.js";




const router = express.Router();


router.post('/', seatController.createSeats);
router.get('/', seatController.getAllSeats)
router.get('/:id', seatController.getSeatsByScreen)
router.put('/:id', seatController.updateSeat)
router.delete('/:id',seatController.deleteSeat)


export default router;