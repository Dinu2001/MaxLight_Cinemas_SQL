import db from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

async function createReview(req, res) {
    try {
        const { userId, filmId, description, rating } = req.body;

        const reviewId = uuidv4();

        await db.query(
            `INSERT INTO review 
            (review_id, user_id, film_id, description, rating)
            VALUES (?, ?, ?, ?, ?)`,
            [reviewId, userId, filmId, description, rating]
        );

        return res.status(201).json({
            message: "Review created successfully",
            data: { reviewId }
        });

    } catch (err) {
        return res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}


async function getReviewByFilmId(req, res) {
    try {
        const filmId = req.params.id;

        const [reviews] = await db.query(
            `SELECT 
                r.review_id,
                r.description,
                r.rating,
                r.created_at,
                u.user_id,
                u.first_name,
                u.last_name,
                u.email,
                f.film_id,
                f.film_name
             FROM review r
             JOIN users u ON r.user_id = u.user_id
             JOIN film f ON r.film_id = f.film_id
             WHERE r.film_id = ?`,
            [filmId]
        );

        if (reviews.length === 0) {
            return res.status(404).json({
                message: "No reviews found for this film"
            });
        }

        return res.status(200).json({
            message: "Reviews fetched successfully",
            data: reviews
        });

    } catch (err) {
        return res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}


async function deleteReview(req, res) {
    try {
        const id = req.params.id;

        const [review] = await db.query(
            "SELECT * FROM review WHERE review_id = ?",
            [id]
        );

        if (review.length === 0) {
            return res.status(404).json({
                message: "Review not found"
            });
        }

        await db.query(
            "DELETE FROM review WHERE review_id = ?",
            [id]
        );

        return res.status(200).json({
            message: "Review deleted successfully"
        });

    } catch (err) {
        return res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}

export default {createReview, deleteReview, getReviewByFilmId};