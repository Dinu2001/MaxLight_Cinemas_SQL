import db from '../config/db.js'
import { v4 as uuidv4 } from 'uuid'

async function saveFilm(req, res) {
    try {
        const {
            film_name,
            genre,
            trailer_link,
            description,
            release_date,
            language,
            duration,
            poster_image,
            status
        } = req.body

        const film_id = uuidv4()

        const sql = `
            INSERT INTO film
            (film_id, film_name, genre, trailer_link, description, release_date, language, duration, poster_image,
             status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `

        await db.query(sql, [
            film_id,
            film_name,
            genre,
            trailer_link,
            description,
            release_date,
            language,
            duration,
            poster_image,
            status || 'ACTIVE'
        ])

        return res.status(201).json({
            message: "Film saved successfully",
            film_id
        })

    } catch (e) {
        return res.status(500).json({
            message: "server error",
            error: e.message
        })
    }

}

async function getAllFilms(req, res) {
    try {
        const [rows] = await db.query("SELECT * FROM film")

        return res.status(200).json({
            message: "Films fetched successfully",
            data: rows
        })

    } catch (e) {
        return res.status(500).json({
            message: "server error",
            error: e.message
        })
    }
}

async function getFilmById(req, res) {
    try {
        const id = req.params.id

        const [rows] = await db.query(
            "SELECT * FROM film WHERE film_id = ?",
            [id]
        )

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Film not found"
            })
        }

        return res.status(200).json({
            message: "Film fetched successfully",
            data: rows[0]
        })

    } catch (e) {
        return res.status(500).json({
            message: "server error",
            error: e.message
        })
    }
}


async function updateFilm(req, res) {
    try {
        const id = req.params.id

        const [check] = await db.query(
            "SELECT * FROM film WHERE film_id = ?",
            [id]
        )

        if (check.length === 0) {
            return res.status(404).json({
                message: "Film not found"
            })
        }

        const sql = `
            UPDATE film SET 
            film_name = ?, 
            genre = ?, 
            trailer_link = ?, 
            description = ?, 
            release_date = ?, 
            language = ?, 
            duration = ?, 
            poster_image = ?, 
            status = ?
            WHERE film_id = ?
        `

        const {
            film_name,
            genre,
            trailer_link,
            description,
            release_date,
            language,
            duration,
            poster_image,
            status
        } = req.body

        await db.query(sql, [
            film_name,
            genre,
            trailer_link,
            description,
            release_date,
            language,
            duration,
            poster_image,
            status,
            id
        ])

        return res.status(200).json({
            message: "Film updated successfully"
        })

    } catch (e) {
        return res.status(500).json({
            message: "server error",
            error: e.message
        })
    }
}

async function deleteFilm(req, res) {
    try {
        const id = req.params.id

        const [check] = await db.query(
            "SELECT * FROM film WHERE film_id = ?",
            [id]
        )

        if (check.length === 0) {
            return res.status(404).json({
                message: "Film not found"
            })
        }

        await db.query(
            "DELETE FROM film WHERE film_id = ?",
            [id]
        )

        return res.status(200).json({
            message: "Film deleted successfully"
        })

    } catch (e) {
        return res.status(500).json({
            message: "server error",
            error: e.message
        })
    }
}

export default {saveFilm, updateFilm, deleteFilm,getAllFilms,getFilmById}