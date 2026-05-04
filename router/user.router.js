
import express from "express";
import authController from "../auth/auth.controller.js";




const router = express.Router();


router.post('/',authController.register);
router.get('/', authController.getUserDetails)
router.get('/:id',authController.getUserById)
router.put('/:id',authController.updateUser)
router.delete('/:id',authController.deleteUser)


export default router;