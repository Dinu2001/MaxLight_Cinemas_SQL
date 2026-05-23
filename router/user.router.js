
import express from "express";
import authController from "../auth/auth.controller.js";
import {verifyToken,authorizeRoles} from "../middelware/auth.middleware.js";




const router = express.Router();


router.post('/register',authController.register);
router.post('/login',authController.login);
router.get('/' ,verifyToken,authorizeRoles("USER","ADMIN","STAFF"),authController.getUserDetails)
router.get('/:id',verifyToken,authorizeRoles("USER","ADMIN","STAFF"),authController.getUserById)
router.put('/:id',verifyToken,authorizeRoles("USER","ADMIN","STAFF"),authController.updateUser)
router.delete('/:id',verifyToken,authorizeRoles("USER","ADMIN","STAFF"),authController.deleteUser)


export default router;