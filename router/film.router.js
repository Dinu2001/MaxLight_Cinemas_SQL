import express from "express";
import filmController from "../controller/film.controller.js";


const router = express.Router();


router.post('/', filmController.saveFilm)
router.get('/', filmController.getAllFilms)
router.get('/:id', filmController.getFilmById)
router.put('/:id', filmController.updateFilm)
router.delete('/:id', filmController.deleteFilm)


export default router;