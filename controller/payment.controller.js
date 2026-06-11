// import db from "../config/db.js";
// import crypto from "crypto";
//
//
// async function savePayment(req, res) {
//
//     const { bookingId, amount, paymentMethod } = req.body;
//
//     // Validation
//     if (!bookingId || !amount || !paymentMethod) {
//         return res.status(400).json({
//             success: false,
//             message: "Missing payment details."
//         });
//     }
//
//     // Get DB transaction connection
//     const connection = await db.getConnection();
//
//     try {
//
//         await connection.beginTransaction();
//
//         // 1. Check booking exists
//         const [bookingRows] = await connection.execute(
//             `SELECT * FROM booking WHERE booking_id = ?`,
//             [bookingId]
//         );
//
//         if (bookingRows.length === 0) {
//
//             await connection.rollback();
//
//             return res.status(404).json({
//                 success: false,
//                 message: "Booking not found."
//             });
//         }
//
//         // 2. Prevent duplicate payment
//         const [existingPayment] = await connection.execute(
//             `SELECT * FROM payment WHERE booking_id = ?`,
//             [bookingId]
//         );
//
//         if (existingPayment.length > 0) {
//
//             await connection.rollback();
//
//             return res.status(400).json({
//                 success: false,
//                 message: "Payment already completed for this booking."
//             });
//         }
//
//         // 3. Create payment ID
//         const paymentId =
//             `PAY-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;
//
//         // 4. Insert payment
//         await connection.execute(
//             `
//             INSERT INTO payment
//             (
//                 payment_id,
//                 booking_id,
//                 amount,
//                 payment_method,
//                 status
//             )
//             VALUES (?, ?, ?, ?, ?)
//             `,
//             [
//                 paymentId,
//                 bookingId,
//                 amount,
//                 paymentMethod,
//                 "PAID"
//             ]
//         );
//
//         // 5. Update booking status
//         await connection.execute(
//             `
//             UPDATE booking
//             SET status = ?
//             WHERE booking_id = ?
//             `,
//             ["PAID", bookingId]
//         );
//
//         // Commit transaction
//         await connection.commit();
//
//         return res.status(200).json({
//             success: true,
//             message: "Payment completed successfully.",
//             data: {
//                 paymentId,
//                 bookingId,
//                 amount,
//                 paymentMethod,
//                 status: "PAID"
//             }
//         });
//
//     } catch (error) {
//
//         await connection.rollback();
//
//         console.error("Payment Error:", error);
//
//         return res.status(500).json({
//             success: false,
//             message: "Payment processing failed.",
//             error: error.message
//         });
//
//     } finally {
//
//         connection.release();
//
//     }
// }
//
//
// export default {savePayment}


import db from "../config/db.js";
import crypto from "crypto";

async function savePayment(req, res) {
    // Read the payload parameters coming from the frontend request body
    const { bookingId, amount, paymentMethod } = req.body;

    console.log("Incoming Payment Request Payload:", { bookingId, amount, paymentMethod });

    // Validation
    if (!bookingId || amount === undefined || amount === null || !paymentMethod) {
        return res.status(400).json({
            success: false,
            message: "Missing payment details. Ensure bookingId, amount, and paymentMethod are provided."
        });
    }

    // Ensure connection extraction checks for pooled vs direct client context frameworks
    let connection;
    try {
        if (typeof db.getConnection === 'function') {
            connection = await db.getConnection();
        } else if (db.pool && typeof db.pool.getConnection === 'function') {
            connection = await db.pool.getConnection();
        } else {
            // Fallback: If your db config directly exports a pool without explicitly exposing getConnection
            connection = db;
        }
    } catch (connError) {
        console.error("Database connection acquisition failed:", connError);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error: Database pipeline unavailable."
        });
    }

    try {
        // Start isolation framework transaction if using dedicated pool connections
        if (connection.beginTransaction) {
            await connection.beginTransaction();
        }

        // 1. Check booking exists
        const [bookingRows] = await connection.execute(
            `SELECT * FROM booking WHERE booking_id = ?`,
            [bookingId]
        );

        if (bookingRows.length === 0) {
            if (connection.rollback) await connection.rollback();
            return res.status(404).json({
                success: false,
                message: `Booking sequence entity not found for ID: ${bookingId}`
            });
        }

        // 2. Prevent duplicate payments on the same reference record
        const [existingPayment] = await connection.execute(
            `SELECT * FROM payment WHERE booking_id = ?`,
            [bookingId]
        );

        if (existingPayment.length > 0) {
            if (connection.rollback) await connection.rollback();
            return res.status(400).json({
                success: false,
                message: "Payment transaction has already been logged for this booking token."
            });
        }

        // 3. Create unique payment identification token
        const paymentId = `PAY-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;

        // 4. Insert payment record (Float parsing guarantees standard currency compatibility)
        const parsedAmount = parseFloat(amount);

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
                parsedAmount,
                String(paymentMethod).toUpperCase(),
                "PAID"
            ]
        );

        // 5. Update parent booking record status configuration parameters
        await connection.execute(
            `
            UPDATE booking 
            SET status = ? 
            WHERE booking_id = ?
            `,
            ["PAID", bookingId]
        );

        // Commit transaction blocks safely
        if (connection.commit) {
            await connection.commit();
        }

        return res.status(200).json({
            success: true,
            message: "Payment recorded and allocated successfully.",
            data: {
                paymentId,
                bookingId,
                amount: parsedAmount,
                paymentMethod,
                status: "PAID"
            }
        });

    } catch (error) {
        // Rollback on errors to prevent partial entries
        try {
            if (connection && connection.rollback) {
                await connection.rollback();
            }
        } catch (rollbackError) {
            console.error("Database transaction rollback runtime exception:", rollbackError);
        }

        console.error("Critical Runtime Error inside Payment execution pipeline:", error);

        return res.status(500).json({
            success: false,
            message: "Payment state processing failed permanently inside data layers.",
            error: error.message
        });

    } finally {
        // Safely return connection back to system resource pools
        if (connection && typeof connection.release === 'function') {
            connection.release();
        }
    }
}

export default { savePayment };