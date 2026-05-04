import express from 'express'
import showtimeController from '../controller/showtime.controller.js'

const router = express.Router()

router.post('/', showtimeController.createShowtime)

router.get('/', showtimeController.getAllShowtimes)
router.get('/:id', showtimeController.getShowtimeById)

router.get('/film/:filmId', showtimeController.getShowtimesByFilm)
router.get('/screen/:screenId', showtimeController.getShowtimesByScreen)

router.put('/:id', showtimeController.updateShowtime)
router.delete('/:id', showtimeController.deleteShowtime)

export default router