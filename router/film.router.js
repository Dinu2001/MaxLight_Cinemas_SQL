import express from "express";
import filmController from "../controller/film.controller.js";


const router = express.Router();

``
router.post('/save', filmController.saveFilm)
router.get('/get-all-film', filmController.getAllFilms)
router.get('/get-all-film/:name', filmController.getFilmByName)
router.get('/:id', filmController.getFilmById)
router.put('/update/:id', filmController.updateFilm)
router.delete('/delete/:id', filmController.deleteFilm)


export default router;