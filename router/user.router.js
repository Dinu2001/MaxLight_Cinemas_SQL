
import express from "express";
import {verifyToken,authorizeRoles} from "../middelware/auth.middleware.js";
import authController from "../auth/auth.controller.js";
import userController from "../controller/user.controller.js";




const router = express.Router();


router.post('/register',authController.register);
router.post('/login',authController.login);
router.get('/' ,authController.getUserDetails)
router.get('/get-by-id/:id',authController.getUserById)
router.put('/update/:id',authController.updateUser)
router.delete('/delete/:id',authController.deleteUser)


router.get('/booking/:id',verifyToken,authController.getUserBookings)




router.get("/me", verifyToken, authController.getMe);

// GET /user/showtime-bookings
router.get("/showtime-bookings", userController.getShowtimeCustomerBookings);




export default router;