import db from '../config/db.js'

async function createSeats(req, res) {
    try {
        const { screenId, rowLabel, seatCount, seatType } = req.body;

        if (!screenId) {
            return res.status(400).json({
                message: "screenId is required"
            });
        }

        // 🔥 Get last seat_id
        const [last] = await db.query(
            "SELECT seat_id FROM seat ORDER BY seat_id DESC LIMIT 1"
        );

        let start = 1;

        if (last.length > 0) {
            const lastId = last[0].seat_id; // SEAT0010
            start = parseInt(lastId.replace("SEAT", "")) + 1;
        }

        const values = [];

        for (let i = 0; i < seatCount; i++) {
            const seatId = "SEAT" + String(start + i).padStart(4, '0');

            values.push([
                seatId,
                screenId,
                rowLabel,
                i + 1,
                seatType || "STANDARD"
            ]);
        }

        const sql = `
            INSERT INTO seat 
            (seat_id, screen_id, row_label, seat_number, seat_type)
            VALUES ?
        `;

        await db.query(sql, [values]);

        return res.status(201).json({
            message: "Seats created successfully",
            total: values.length
        });

    } catch (err) {
        return res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}


async function getAllSeats(req, res) {
    try {
        const [rows] = await db.query(`
            SELECT s.*, sc.screen_name 
            FROM seat s
            JOIN screen sc ON s.screen_id = sc.screen_id
        `);

        return res.status(200).json({
            message: "Seats fetched successfully",
            data: rows
        });

    } catch (err) {
        return res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}


async function getSeatsByScreen(req, res) {
    try {
        const screenId = req.params.id;

        const [rows] = await db.query(
            "SELECT * FROM seat WHERE screen_id = ? ORDER BY row_label, seat_number",
            [screenId]
        );

        return res.status(200).json({
            message: "Screen seats fetched successfully",
            data: rows
        });

    } catch (err) {
        return res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}


async function updateSeat(req, res) {
    try {
        const id = req.params.id;
        const { row_label, seat_number, seat_type } = req.body;

        const [check] = await db.query(
            "SELECT * FROM seat WHERE seat_id = ?",
            [id]
        );

        if (check.length === 0) {
            return res.status(404).json({
                message: "Seat not found"
            });
        }

        await db.query(
            `UPDATE seat 
             SET row_label = ?, seat_number = ?, seat_type = ?
             WHERE seat_id = ?`,
            [row_label, seat_number, seat_type, id]
        );

        return res.status(200).json({
            message: "Seat updated successfully"
        });

    } catch (err) {
        return res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}

async function deleteSeat(req, res) {
    try {
        const id = req.params.id;

        const [check] = await db.query(
            "SELECT * FROM seat WHERE seat_id = ?",
            [id]
        );

        if (check.length === 0) {
            return res.status(404).json({
                message: "Seat not found"
            });
        }

        await db.query(
            "DELETE FROM seat WHERE seat_id = ?",
            [id]
        );

        return res.status(200).json({
            message: "Seat deleted successfully"
        });

    } catch (err) {
        return res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}

export default {createSeats, getAllSeats, getSeatsByScreen, updateSeat, deleteSeat};