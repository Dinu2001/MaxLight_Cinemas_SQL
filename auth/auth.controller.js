import db from "../config/db.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

async function register(req, res) {
    try {
        const { firstName, lastName, email, phoneNumber, password, role, status } = req.body;

        const [existing] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();
        await db.query(
            `INSERT INTO users 
            (user_id, first_name, last_name, email, phone_number, password_hash, role, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                firstName,
                lastName,
                email,
                phoneNumber,
                hashPassword,
                role,
                status || "ACTIVE"
            ]
        );

        return res.status(201).json({
            message: "User created successfully",
            data: { userId, firstName, lastName }
        });

    } catch (err) {
        return res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}







async function login(req, res) {
    try {
        const { email, password } = req.body;
        // 1. Find
        const [rows] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );
        if (rows.length === 0) {
            return res.status(400).json({
                message: "User does not exist"
            });
        }
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({
                message: "Email or password is incorrect"
            });
        }
        const token = jwt.sign(
            {
                id: user.user_id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        return res.status(200).json({
            message: "User login successfully",
            token
        });
    } catch (err) {
        return res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}



async function getUserDetails(req, res) {
    try {
        const [users] = await db.query(
            `SELECT user_id, first_name, last_name, email, phone_number, role, status 
             FROM users`
        );
        return res.status(200).json({
            message: "User details found",
            data: users
        });
    } catch (err) {
        return res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}


async function updateUser(req, res) {
    try {
        const id = req.params.id;
        const { firstName, lastName, email, phoneNumber, role, status } = req.body;
        // check user exists
        const [user] = await db.query(
            "SELECT * FROM users WHERE user_id = ?",
            [id]
        );
        if (user.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        await db.query(
            `UPDATE users 
             SET first_name = ?, last_name = ?, email = ?, phone_number = ?, role = ?, status = ?
             WHERE user_id = ?`,
            [firstName, lastName, email, phoneNumber, role, status, id]
        );
        return res.status(200).json({
            message: "User updated successfully"
        });
    } catch (err) {
        return res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}


async function deleteUser(req, res) {
    try {
        const id = req.params.id;

        const [user] = await db.query(
            "SELECT * FROM users WHERE user_id = ?",
            [id]
        );
        if (user.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        await db.query(
            "DELETE FROM users WHERE user_id = ?",
            [id]
        );
        return res.status(200).json({
            message: "User deleted successfully"
        });
    } catch (err) {
        return res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}




async function getUserById(req, res) {
    try {
        const id = req.params.id;
        const [rows] = await db.query(
            `SELECT 
                user_id,
                first_name,
                last_name,
                email,
                phone_number,
                role,
                status
             FROM users
             WHERE user_id = ?`,
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        return res.status(200).json({
            message: "User fetched successfully",
            data: rows[0]
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}



export async function getUserBookings(req, res) {
    try {
        // Read the user ID directly from the URL path variable (:id)
        const { id: userId } = req.params;

        // Guard clause validation
        if (!userId || userId === "undefined" || userId === "null") {
            return res.status(400).json({
                success: false,
                message: "Identification context missing or invalid in request URL path parameters."
            });
        }

        // Fetch user transaction footprint based on the passed user_id parameter
        // Replacing f.poster_url with NULL to prevent the "Unknown column" database exception
        const [rows] = await db.query(
            `
            SELECT 
                b.booking_id,
                b.booking_date,
                b.total_seats,
                b.status,
                s.show_date,
                s.start_time,
                f.film_name,
                NULL AS poster_url,
                sc.screen_name,
                st.row_label,
                st.seat_number
            FROM booking b
            INNER JOIN showtime s ON b.showtime_id = s.showtime_id
            INNER JOIN film f ON s.film_id = f.film_id
            INNER JOIN screen sc ON s.screen_id = sc.screen_id
            LEFT JOIN booking_seat bs ON b.booking_id = bs.booking_id
            LEFT JOIN seat st ON bs.seat_id = st.seat_id
            WHERE b.user_id = ? AND b.status != 'CANCELLED'
            ORDER BY b.booking_date DESC
            `,
            [userId]
        );

        // Group individual seat rows into single historical ticket blocks
        const bookingsMap = {};

        for (const row of rows) {
            if (!bookingsMap[row.booking_id]) {
                bookingsMap[row.booking_id] = {
                    id: row.booking_id,
                    movieTitle: row.film_name,
                    moviePoster: row.poster_url, // This will cleanly be null now
                    date: new Date(row.show_date).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                    }),
                    time: row.start_time,
                    theaterName: row.screen_name,
                    status: row.status,
                    seats: []
                };
            }
            // Append mapped strings like "A1", "A2" to the seats array configuration
            if (row.row_label && row.seat_number) {
                bookingsMap[row.booking_id].seats.push(`${row.row_label}${row.seat_number}`);
            }
        }

        // Transform the object dictionary map collection back into a flat array payload
        const processedBookings = Object.values(bookingsMap);

        return res.status(200).json({
            success: true,
            count: processedBookings.length,
            userId,
            data: processedBookings
        });

    } catch (error) {
        console.error("Error encountered executing getUserBookings:", error);
        return res.status(500).json({
            success: false,
            message: "Failed reading personal receipt repository collections.",
            error: error.message
        });
    }
}








async function getMe(req, res) {
    try {

        return res.status(200).json({
            success: true,
            user: {
                id: req.user.id,
                email: req.user.email,
                role: req.user.role
            }
        });

    } catch(error) {

        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });

    }
}








export default { register, getUserDetails, updateUser, deleteUser,getUserById ,login,getUserBookings,getMe};