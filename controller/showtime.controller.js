import db from '../config/db.js'

async function createShowtime(req, res) {
    try {
        const { filmId, screenId, showDate, startTime, endTime } = req.body;

        if (!filmId || !screenId) {
            return res.status(400).json({
                message: "filmId and screenId are required"
            });
        }


        const [last] = await db.query(
            "SELECT showtime_id FROM showtime ORDER BY showtime_id DESC LIMIT 1"
        );

        let newId = "SHOW001";

        if (last.length > 0) {
            const lastId = last[0].showtime_id;
            const number = parseInt(lastId.replace("SHOW", "")) + 1;
            newId = "SHOW" + String(number).padStart(3, '0');
        }

        const sql = `
            INSERT INTO showtime
            (showtime_id, film_id, screen_id, show_date, start_time, end_time)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        await db.query(sql, [
            newId,
            filmId,
            screenId,
            showDate,
            startTime,
            endTime
        ]);

        return res.status(201).json({
            message: "Showtime created successfully",
            showtime_id: newId
        });

    } catch (err) {
        return res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}


async function getAllShowtimes(req, res) {
    try {
        const [rows] = await db.query(`
            SELECT st.*, 
                   f.film_name, 
                   sc.screen_name
            FROM showtime st
            JOIN film f ON st.film_id = f.film_id
            JOIN screen sc ON st.screen_id = sc.screen_id
        `);

        return res.status(200).json({
            message: "Showtimes fetched successfully",
            data: rows
        });

    } catch (err) {
        return res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}



async function getShowtimeById(req, res) {
    try {
        const id = req.params.id;

        const [rows] = await db.query(`
            SELECT st.*, f.film_name, sc.screen_name
            FROM showtime st
            JOIN film f ON st.film_id = f.film_id
            JOIN screen sc ON st.screen_id = sc.screen_id
            WHERE st.showtime_id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Showtime not found"
            });
        }

        return res.status(200).json({
            message: "Showtime fetched successfully",
            data: rows[0]
        });

    } catch (err) {
        return res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}


async function getShowtimesByFilm(req, res) {
    try {
        const filmId = req.params.filmId;

        const [rows] = await db.query(`
            SELECT st.*, sc.screen_name
            FROM showtime st
            JOIN screen sc ON st.screen_id = sc.screen_id
            WHERE st.film_id = ?
        `, [filmId]);

        return res.status(200).json({
            message: "Film showtimes fetched successfully",
            data: rows
        });

    } catch (err) {
        return res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}


async function getShowtimesByScreen(req, res) {
    try {
        const screenId = req.params.screenId;

        const [rows] = await db.query(`
            SELECT st.*, f.film_name
            FROM showtime st
            JOIN film f ON st.film_id = f.film_id
            WHERE st.screen_id = ?
        `, [screenId]);

        return res.status(200).json({
            message: "Screen showtimes fetched successfully",
            data: rows
        });

    } catch (err) {
        return res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}

async function updateShowtime(req, res) {
    try {
        const id = req.params.id;
        const { filmId, screenId, showDate, startTime, endTime, status } = req.body;

        const [check] = await db.query(
            "SELECT * FROM showtime WHERE showtime_id = ?",
            [id]
        );

        if (check.length === 0) {
            return res.status(404).json({
                message: "Showtime not found"
            });
        }

        await db.query(`
            UPDATE showtime SET
                film_id = ?,
                screen_id = ?,
                show_date = ?,
                start_time = ?,
                end_time = ?,
                status = ?
            WHERE showtime_id = ?
        `, [filmId, screenId, showDate, startTime, endTime, status, id]);

        return res.status(200).json({
            message: "Showtime updated successfully"
        });

    } catch (err) {
        return res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}

async function deleteShowtime(req, res) {
    try {
        const id = req.params.id;

        const [check] = await db.query(
            "SELECT * FROM showtime WHERE showtime_id = ?",
            [id]
        );

        if (check.length === 0) {
            return res.status(404).json({
                message: "Showtime not found"
            });
        }

        await db.query(
            "DELETE FROM showtime WHERE showtime_id = ?",
            [id]
        );

        return res.status(200).json({
            message: "Showtime deleted successfully"
        });

    } catch (err) {
        return res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}

export default {createShowtime,getAllShowtimes,getShowtimesByFilm,getShowtimesByScreen,getShowtimeById,updateShowtime,deleteShowtime}