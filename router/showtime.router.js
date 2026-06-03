import express from 'express'
import showtimeController from '../controller/showtime.controller.js'

const router = express.Router()

router.post('/save', showtimeController.createShowtime)

router.get('/', showtimeController.getAllShowtimes)
router.get('/:id', showtimeController.getShowtimeById)

router.get('/film/:filmId', showtimeController.getShowtimesByFilm)
router.get('/screen/:screenId', showtimeController.getShowtimesByScreen)

router.put('/update/:id', showtimeController.updateShowtime)
router.delete('/delete/:id', showtimeController.deleteShowtime)


router.get('/admin/all', showtimeController.getAdminShowtimeLogs);

export default router