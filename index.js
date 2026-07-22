import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import db from "./config/db.js"; // <-- Import db here

import filmRouter from "./router/film.router.js";
import screenRouter from "./router/screen.router.js";
import seatRouter from "./router/seat.router.js";
import showtimeRouter from "./router/showtime.router.js";
import userRouter from "./router/user.router.js";
import reviewRouter from "./router/review.router.js";
import bookingRouter from "./router/booking.router.js";
import bookingSeatRouter from "./router/bookedSeat.router.js";
import paymentRouter from "./router/payment.router.js";
import analyticsRouter from "./router/analytics.router.js";

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors());

const port = process.env.PORT || 5000

async function checkDBConnection() {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS result')
        console.log('Database connected. Test result:', rows[0].result)
    } catch (error) {
        console.error('Database connection failed:', error.message)
    }
}

app.use("/film", filmRouter)
app.use("/screen", screenRouter)
app.use("/seat", seatRouter)
app.use("/showtime", showtimeRouter)
app.use("/user", userRouter)
app.use("/booking", bookingRouter)
app.use("/book-seat", bookingSeatRouter)
app.use("/review", reviewRouter)
app.use("/payment", paymentRouter)

app.use("/api/analytics", analyticsRouter)

app.get("/test", (req, res) => {
    res.send("Server is working");
});

app.listen(port, () => {
    checkDBConnection(); // <-- Added parentheses to execute function
    console.log(`Express server listening on port ${port}`)
})