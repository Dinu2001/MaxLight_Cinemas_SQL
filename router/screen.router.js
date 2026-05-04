import express from "express";
import screenController from "../controller/screen.controller.js";



const router = express.Router();


router.post('/', screenController.createScreen)
router.get('/', screenController.getAllScreens)
router.get('/:id', screenController.getScreenById)
router.put('/:id', screenController.updateScreen)
router.delete('/:id',screenController.deleteScreen)


export default router;