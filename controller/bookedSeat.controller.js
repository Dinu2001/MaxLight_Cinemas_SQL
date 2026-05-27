import db from "../config/db.js";

// NEW FUNCTION: Fetches all booked/occupied seats for a specific showtime id cleanly
export async function getBookedSeatsByShowtime(req, res) {
    try {
        const { showtimeId } = req.params;

        // Validation guard clause
        if (!showtimeId) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameter: showtimeId"
            });
        }

        // Query returns only valid, non-cancelled seats tied to this showtime
        const [seatRows] = await db.query(
            `
            SELECT s.row_label, s.seat_number
            FROM booking_seat bs
            INNER JOIN booking b ON bs.booking_id = b.booking_id
            INNER JOIN seat s ON bs.seat_id = s.seat_id
            WHERE b.showtime_id = ?
              AND b.status != 'CANCELLED'
            `,
            [showtimeId]
        );

        // Map into flat structure array format: ["A1", "A2", "B5"]
        const bookedSeatsArray = seatRows.map(r => `${r.row_label}${r.seat_number}`);

        return res.status(200).json({
            success: true,
            message: "Showtime seat availability map fetched successfully",
            showtimeId,
            count: bookedSeatsArray.length,
            data: bookedSeatsArray
        });

    } catch (error) {
        console.error("CRITICAL EXCEPTION in getBookedSeatsByShowtime:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error reading seat availability records.",
            error: error.message
        });
    }
}

export async function getBookedSeats(req, res) {
    try {
        const { filmId, showtimeId } = req.params;

        if (!filmId || !showtimeId) {
            return res.status(400).json({ message: "Missing required filmId or showtimeId" });
        }

        const [seatRows] = await db.query(
            `
            SELECT s.row_label, s.seat_number
            FROM booking_seat bs
            INNER JOIN booking b ON bs.booking_id = b.booking_id
            INNER JOIN seat s ON bs.seat_id = s.seat_id
            WHERE b.showtime_id = ?
              AND b.status != 'CANCELLED'
            `,
            [showtimeId]
        );

        const bookedSeatsArray = seatRows.map(r => `${r.row_label}${r.seat_number}`);

        return res.json({
            message: "Booked seats fetched successfully",
            filmId,
            showtimeId,
            data: bookedSeatsArray
        });

    } catch (error) {
        console.error("Error in getBookedSeats:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}




export async function createBooking(req, res) {
    // Get a dedicated connection client from the pool to handle safe transactions
    const connection = await db.getConnection();

    try {
        const { userId, showtimeId, seats } = req.body;

        console.log("BACKEND TRANSACTING CHECKOUT:", { userId, showtimeId, seats });

        if (!showtimeId || showtimeId === "undefined" || showtimeId === "null") {
            return res.status(400).json({ message: "Booking rejected: showtimeId is invalid." });
        }
        if (!userId) {
            return res.status(400).json({ message: "Booking rejected: userId context is missing." });
        }
        if (!seats || seats.length === 0) {
            return res.status(400).json({ message: "No seats selected." });
        }

        // START TRANSACTION - Locks out dirty multi-thread execution reading
        await connection.beginTransaction();

        // 1. FOR UPDATE READ LOCK: Query existing records while blocking incoming parallel lookups
        const [alreadyBooked] = await connection.query(
            `
            SELECT s.row_label, s.seat_number
            FROM booking_seat bs
            INNER JOIN booking b ON bs.booking_id = b.booking_id
            INNER JOIN seat s ON bs.seat_id = s.seat_id
            WHERE b.showtime_id = ? 
              AND b.status != 'CANCELLED'
            FOR UPDATE
            `,
            [showtimeId]
        );

        const takenSeatLabels = alreadyBooked.map(r => `${r.row_label}${r.seat_number}`);
        const conflictedSeats = seats.filter(seat => takenSeatLabels.includes(seat));

        if (conflictedSeats.length > 0) {
            await connection.rollback(); // Release transaction immediately
            return res.status(409).json({
                success: false,
                message: `Seats [${conflictedSeats.join(", ")}] were locked or booked by another user context. Request denied.`,
                conflict: true
            });
        }

        // 2. INSERT MAIN BOOKING HEADER RECORD
        const bookingId = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const currentTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

        await connection.query(
            `INSERT INTO booking (booking_id, user_id, showtime_id, booking_date, total_seats, status) 
             VALUES (?, ?, ?, ?, ?, 'PENDING')`,
            [bookingId, userId, showtimeId, currentTimestamp, seats.length]
        );

        // 3. LOOP & VERIFY SEAT RECORDS
        for (const seatLabel of seats) {
            const rowLabel = seatLabel.charAt(0);
            const seatNum = seatLabel.substring(1);

            const [seatRecord] = await connection.query(
                `SELECT seat_id FROM seat WHERE row_label = ? AND seat_number = ?`,
                [rowLabel, seatNum]
            );

            if (seatRecord.length === 0) {
                throw new Error(`Seat verification anomaly: ${seatLabel} does not exist in inventory.`);
            }

            const targetSeatId = seatRecord[0].seat_id;
            const bookingSeatId = `BS-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

            // Insert line items. If a duplicate slips through, database triggers ER_DUP_ENTRY instantly here
            await connection.query(
                `INSERT INTO booking_seat (booking_seat_id, booking_id, seat_id) VALUES (?, ?, ?)`,
                [bookingSeatId, bookingId, targetSeatId]
            );
        }

        // Commit transaction all at once if every insertion statement succeeds cleanly
        await connection.commit();

        return res.status(201).json({
            success: true,
            message: "Booking finalized safely!",
            data: { bookingId }
        });

    } catch (error) {
        // Rollback ensures no partial phantom bookings remain saved in the database tables
        await connection.rollback();
        console.error("CRITICAL TRANSACTION CONCURRENCY INTERCEPTED:", error);

        // Catch database duplicate collision code safely
        if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
            return res.status(409).json({
                success: false,
                message: "Concurrency Intercept: One or more selected seats were assigned simultaneously elsewhere. Re-evaluating canvas matrix map.",
                conflict: true
            });
        }

        return res.status(500).json({ success: false, message: "Database transaction exception.", error: error.message });
    } finally {
        connection.release(); // Return thread pool client connection back safely
    }
}








export async function cancelBooking(req, res) {
    try {
        const { bookingId } = req.params;
        const [booking] = await db.query(`SELECT * FROM booking WHERE booking_id = ?`, [bookingId]);
        if (booking.length === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }
        await db.query(`UPDATE booking SET status = 'CANCELLED' WHERE booking_id = ?`, [bookingId]);
        return res.json({ message: "Booking cancelled successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}







export default { cancelBooking, getBookedSeats, createBooking, getBookedSeatsByShowtime};