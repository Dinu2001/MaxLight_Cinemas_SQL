import db from "../config/db.js";

export const getRevenueAnalytics = async (req, res) => {
    try {
        const query = `
      SELECT 
        s.showtime_id,
        f.film_name AS filmTitle,
        s.show_date AS showDate,
        s.start_time AS startTime,
        s.end_time AS endTime,
        sc.screen_name AS screenName,
        COALESCE(SUM(b.total_seats), 0) AS ticketsSold,
        COALESCE(SUM(p.amount), 0) AS totalRevenue
      FROM showtime s
      JOIN film f ON s.film_id = f.film_id
      LEFT JOIN screen sc ON s.screen_id = sc.screen_id
      LEFT JOIN booking b ON s.showtime_id = b.showtime_id
      LEFT JOIN payment p ON b.booking_id = p.booking_id AND p.status = 'PAID'
      GROUP BY s.showtime_id, f.film_name, s.show_date, s.start_time, s.end_time, sc.screen_name
      ORDER BY totalRevenue DESC, s.show_date DESC;
    `;

        const [rows] = await db.query(query);

        return res.status(200).json({
            success: true,
            data: rows,
        });
    } catch (error) {
        console.error("Error fetching revenue analytics:", error);
        return res.status(500).json({
            success: false,
            message: "Server error fetching analytics data.",
        });
    }
};