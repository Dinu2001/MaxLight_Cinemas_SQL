import db from "../config/db.js";
import router from "../router/film.router.js";

 const getShowtimeCustomerBookings = async (req, res) => {
    try {
        const query = `
      SELECT 
        s.showtime_id,
        s.show_date,
        s.start_time,
        f.film_name,
        sc.screen_name,
        u.user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone_number,
        b.booking_id,
        b.total_seats,
        b.status AS booking_status,
        p.amount AS paid_amount,
        p.payment_method,
        p.status AS payment_status
      FROM showtime s
      JOIN film f ON s.film_id = f.film_id
      JOIN screen sc ON s.screen_id = sc.screen_id
      JOIN booking b ON s.showtime_id = b.showtime_id
      JOIN users u ON b.user_id = u.user_id
      LEFT JOIN payment p ON b.booking_id = p.booking_id
      WHERE b.status = 'PAID'
      ORDER BY s.show_date DESC, s.start_time ASC, u.first_name ASC;
    `;

        const [rows] = await db.query(query);

        // Grouping results by Showtime ID
        const groupedData = {};

        rows.forEach((row) => {
            const showId = row.showtime_id;

            if (!groupedData[showId]) {
                groupedData[showId] = {
                    showtimeId: showId,
                    filmName: row.film_name.trim(),
                    showDate: row.show_date,
                    startTime: row.start_time,
                    screenName: row.screen_name,
                    customers: [],
                };
            }

            groupedData[showId].customers.push({
                bookingId: row.booking_id,
                userId: row.user_id,
                name: `${row.first_name || ""} ${row.last_name || ""}`.trim(),
                email: row.email,
                phone: row.phone_number || "N/A",
                seatsBooked: row.total_seats,
                paidAmount: row.paid_amount || 0,
                paymentMethod: row.payment_method || "N/A",
            });
        });

        res.status(200).json({
            success: true,
            data: Object.values(groupedData),
        });
    } catch (error) {
        console.error("Error fetching showtime customer bookings:", error);
        res.status(500).json({
            success: false,
            message: "Server Error fetching showtime bookings",
        });
    }
};

 export default {getShowtimeCustomerBookings};