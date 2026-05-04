import db from "../config/db.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

async function register(req, res) {
    try {
        const { firstName, lastName, email, phoneNumber, password, role, status } = req.body;

        // 1. check user exists
        const [existing] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 2. hash password
        const hashPassword = await bcrypt.hash(password, 10);

        const userId = uuidv4();

        // 3. insert user
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

import db from "../config/db.js";

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
                status,
                created_at
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
        return res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}




export default { register, getUserDetails, updateUser, deleteUser,getUserById };