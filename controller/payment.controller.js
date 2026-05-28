import db from "../config/db.js";
import crypto from "crypto";


async function savePayment(req, res) {

    const { bookingId, amount, paymentMethod } = req.body;

    // Validation
    if (!bookingId || !amount || !paymentMethod) {
        return res.status(400).json({
            success: false,
            message: "Missing payment details."
        });
    }

    // Get DB transaction connection
    const connection = await db.getConnection();

    try {

        await connection.beginTransaction();

        // 1. Check booking exists
        const [bookingRows] = await connection.execute(
            `SELECT * FROM booking WHERE booking_id = ?`,
            [bookingId]
        );

        if (bookingRows.length === 0) {

            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Booking not found."
            });
        }

        // 2. Prevent duplicate payment
        const [existingPayment] = await connection.execute(
            `SELECT * FROM payment WHERE booking_id = ?`,
            [bookingId]
        );

        if (existingPayment.length > 0) {

            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Payment already completed for this booking."
            });
        }

        // 3. Create payment ID
        const paymentId =
            `PAY-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;

        // 4. Insert payment
        await connection.execute(
            `
            INSERT INTO payment
            (
                payment_id,
                booking_id,
                amount,
                payment_method,
                status
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                paymentId,
                bookingId,
                amount,
                paymentMethod,
                "PAID"
            ]
        );

        // 5. Update booking status
        await connection.execute(
            `
            UPDATE booking
            SET status = ?
            WHERE booking_id = ?
            `,
            ["PAID", bookingId]
        );

        // Commit transaction
        await connection.commit();

        return res.status(200).json({
            success: true,
            message: "Payment completed successfully.",
            data: {
                paymentId,
                bookingId,
                amount,
                paymentMethod,
                status: "PAID"
            }
        });

    } catch (error) {

        await connection.rollback();

        console.error("Payment Error:", error);

        return res.status(500).json({
            success: false,
            message: "Payment processing failed.",
            error: error.message
        });

    } finally {

        connection.release();

    }
}


export default {savePayment}