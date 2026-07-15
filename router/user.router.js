
import express from "express";
import authController from "../auth/auth.controller.js";
import {verifyToken,authorizeRoles} from "../middelware/auth.middleware.js";




const router = express.Router();


router.post('/register',authController.register);
router.post('/login',authController.login);
router.get('/' ,verifyToken,authController.getUserDetails)
router.get('/get-by-id/:id',verifyToken,authController.getUserById)
router.put('/update/:id',verifyToken,authController.updateUser)
router.delete('/delete/:id',verifyToken,authController.deleteUser)


router.get('/booking/:id',verifyToken,authController.getUserBookings)




router.get("/me", verifyToken, authController.getMe);




export default router;