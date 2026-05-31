
import express from "express";
import authController from "../auth/auth.controller.js";
import {verifyToken,authorizeRoles} from "../middelware/auth.middleware.js";




const router = express.Router();


router.post('/register',authController.register);
router.post('/login',authController.login);
router.get('/' ,authController.getUserDetails)
router.get('/get-by-id/:id',authController.getUserById)
router.put('/update/:id',authController.updateUser)
router.delete('/delete/:id',authController.deleteUser)


router.get('/booking/:id',authController.getUserBookings)



export default router;