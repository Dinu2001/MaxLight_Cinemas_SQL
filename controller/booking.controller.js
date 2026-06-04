import db from "../config/db.js"; // mysql2 pool connection
import { v4 as uuidv4 } from "uuid";

async function createBooking(req, res) {
    console.log(req.body)
    try {
        const { userId, showtimeId, seats } = req.body;

        if (!seats || seats.length === 0) {
            return res.status(400).json({ message: "Seats are required" });
        }

        const bookingId = uuidv4();

        // 1. Insert booking
        await db.query(
            `INSERT INTO booking (booking_id, user_id, showtime_id, total_seats, status)
             VALUES (?, ?, ?, ?, ?)`,
            [bookingId, userId, showtimeId, seats.length, "PENDING"]
        );

        // 2. Insert booking seats
        for (let seatCode of seats) {
            const rowLabel = seatCode.charAt(0);
            const seatNumber = parseInt(seatCode.slice(1));

            const [seatRows] = await db.query(
                `SELECT seat_id FROM seat 
                 WHERE row_label = ? AND seat_number = ?`,
                [rowLabel, seatNumber]
            );

            if (seatRows.length > 0) {
                const seatId = seatRows[0].seat_id;

                await db.query(
                    `INSERT INTO booking_seat (booking_seat_id, booking_id, seat_id)
                     VALUES (?, ?, ?)`,
                    [uuidv4(), bookingId, seatId]
                );
            }
        }

        return res.status(201).json({
            message: "Booking created successfully",
            data: { bookingId }
        });

    } catch (err) {
        return res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}


async function getAllBookings(req, res) {
    try {
        const [bookings] = await db.query(`
            SELECT 
                b.*,
                u.first_name,
                u.last_name,
                u.email,
                s.start_time,
                s.end_time
            FROM booking b
            JOIN users u ON b.user_id = u.user_id
            JOIN showtime s ON b.showtime_id = s.showtime_id
        `);

        const [bookingSeats] = await db.query(`
            SELECT 
                bs.booking_id,
                se.row_label,
                se.seat_number
            FROM booking_seat bs
            JOIN seat se ON bs.seat_id = se.seat_id
        `);

        const result = bookings.map(b => {
            const seats = bookingSeats
                .filter(bs => bs.booking_id === b.booking_id)
                .map(bs => `${bs.row_label}${bs.seat_number}`);

            return { ...b, seats };
        });

        return res.status(200).json({
            message: "Bookings fetched successfully",
            data: result
        });

    } catch (err) {
        return res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}


async function getBookingById(req, res) {
    try {
        const id = req.params.id;

        const [bookingRows] = await db.query(
            `SELECT * FROM booking WHERE booking_id = ?`,
            [id]
        );

        if (bookingRows.length === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const [seatRows] = await db.query(`
            SELECT se.row_label, se.seat_number
            FROM booking_seat bs
            JOIN seat se ON bs.seat_id = se.seat_id
            WHERE bs.booking_id = ?
        `, [id]);

        const seats = seatRows.map(s => `${s.row_label}${s.seat_number}`);

        return res.status(200).json({
            message: "Booking fetched successfully",
            data: {
                ...bookingRows[0],
                seats
            }
        });

    } catch (err) {
        return res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}

async function updateBooking(req, res) {
    try {
        const id = req.params.id;

        await db.query(
            `UPDATE booking SET ? WHERE booking_id = ?`,
            [req.body, id]
        );

        return res.status(200).json({
            message: "Booking updated successfully"
        });

    } catch (err) {
        return res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}


async function deleteBooking(req, res) {
    try {
        const id = req.params.id;

        await db.query(`DELETE FROM booking_seat WHERE booking_id = ?`, [id]);
        await db.query(`DELETE FROM booking WHERE booking_id = ?`, [id]);

        return res.status(200).json({
            message: "Booking deleted successfully"
        });

    } catch (err) {
        return res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}


export default {createBooking,getAllBookings,getBookingById,updateBooking,deleteBooking};