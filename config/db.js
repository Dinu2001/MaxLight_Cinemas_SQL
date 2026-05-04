import mysql from 'mysql2'
import dotenv from 'dotenv'

dotenv.config()

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB_NAME,
})

// Test DB connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err)
        return
    }
    console.log('Connected to MySQL')

    connection.query('SELECT 1 + 1 AS solution', (err, results) => {
        connection.release()

        if (err) {
            console.error(err)
            return
        }

        console.log('The solution is:', results[0].solution)
    })
})


export default pool.promise()