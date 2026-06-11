import db from "../config/db.js";

// async function createScreen(req, res) {
//     try {
//         const { screen_name, capacity, screen_type } = req.body;
//
//         // 🔥 Get last screen_id
//         const [rows] = await db.query(
//             "SELECT screen_id FROM screen ORDER BY screen_id DESC LIMIT 1"
//         );
//
//         let newId = "SCREEN001";
//
//         if (rows.length > 0) {
//             const lastId = rows[0].screen_id; // SCREEN005
//             const number = parseInt(lastId.replace("SCREEN", "")) + 1;
//             newId = "SCREEN" + String(number).padStart(3, '0');
//         }
//
//         const sql = `
//             INSERT INTO screen (screen_id, screen_name, capacity, screen_type)
//             VALUES (?, ?, ?, ?)
//         `;
//
//         await db.query(sql, [newId, screen_name, capacity, screen_type]);
//
//         return res.status(201).json({
//             message: "Screen created successfully",
//             screen_id: newId
//         });
//
//     } catch (err) {
//         return res.status(500).json({
//             message: "server error",
//             error: err.message
//         });
//     }
// }
//
// async function getAllScreens(req, res) {
//     try {
//         const [rows] = await db.query("SELECT * FROM screen");
//
//         return res.status(200).json({
//             message: "Screens fetched successfully",
//             data: rows
//         });
//
//     } catch (err) {
//         return res.status(500).json({
//             message: "server error",
//             error: err.message
//         });
//     }
// }
//
// async function getScreenById(req, res) {
//     try {
//         const id = req.params.id;
//
//         const [rows] = await db.query(
//             "SELECT * FROM screen WHERE screen_id = ?",
//             [id]
//         );
//
//         if (rows.length === 0) {
//             return res.status(404).json({
//                 message: "Screen not found"
//             });
//         }
//
//         return res.status(200).json({
//             message: "Screen fetched successfully",
//             data: rows[0]
//         });
//
//     } catch (err) {
//         return res.status(500).json({
//             message: "server error",
//             error: err.message
//         });
//     }
// }
//
// async function updateScreen(req, res) {
//     try {
//         const id = req.params.id;
//         const { screen_name, capacity, screen_type } = req.body;
//
//         const [check] = await db.query(
//             "SELECT * FROM screen WHERE screen_id = ?",
//             [id]
//         );
//
//         if (check.length === 0) {
//             return res.status(404).json({
//                 message: "Screen not found"
//             });
//         }
//
//         const sql = `
//             UPDATE screen
//             SET screen_name = ?, capacity = ?, screen_type = ?
//             WHERE screen_id = ?
//         `;
//
//         await db.query(sql, [screen_name, capacity, screen_type, id]);
//
//         return res.status(200).json({
//             message: "Screen updated successfully"
//         });
//
//     } catch (err) {
//         return res.status(500).json({
//             message: "server error",
//             error: err.message
//         });
//     }
// }
//
//
// async function deleteScreen(req, res) {
//     try {
//         const id = req.params.id;
//
//         const [check] = await db.query(
//             "SELECT * FROM screen WHERE screen_id = ?",
//             [id]
//         );
//
//         if (check.length === 0) {
//             return res.status(404).json({
//                 message: "Screen not found"
//             });
//         }
//
//         await db.query(
//             "DELETE FROM screen WHERE screen_id = ?",
//             [id]
//         );
//
//         return res.status(200).json({
//             message: "Screen deleted successfully"
//         });
//
//     } catch (err) {
//         return res.status(500).json({
//             message: "server error",
//             error: err.message
//         });
//     }
// }
//
//
//
//
// async function getScreenByName(req, res) {
//     try {
//         const screenName = req.params.screenName;
//
//         const [rows] = await db.query(
//             "SELECT * FROM screen WHERE screen_name = ?",
//             [screenName]
//         );
//
//         if (rows.length === 0) {
//             return res.status(404).json({
//                 message: "Screen not found"
//             });
//         }
//
//         return res.status(200).json({
//             message: "Screen fetched successfully",
//             data: rows[0]
//         });
//
//     } catch (err) {
//         return res.status(500).json({
//             message: "server error",
//             error: err.message
//         });
//     }
// }




async function createScreen(req, res) {
    try {
        const { screen_name, capacity, screen_type } = req.body;

        const [rows] = await db.query(
            "SELECT screen_id FROM screen ORDER BY screen_id DESC LIMIT 1"
        );

        let newId = "SCREEN001";

        if (rows.length > 0) {
            const lastId = rows[0].screen_id;
            const number = parseInt(lastId.replace("SCREEN", "")) + 1;
            newId = "SCREEN" + String(number).padStart(3, '0');
        }

        const sql = `
            INSERT INTO screen (screen_id, screen_name, capacity, screen_type)
            VALUES (?, ?, ?, ?)
        `;

        await db.query(sql, [newId, screen_name, capacity, screen_type]);

        return res.status(201).json({
            message: "Screen created successfully",
            screen_id: newId
        });

    } catch (err) {
        return res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}

async function getAllScreens(req, res) {
    try {
        const { status } = req.query;

        let sql = "SELECT * FROM screen";
        let params = [];

        // filter only if status is provided
        if (status === "active" || status === "deactive") {
            sql += " WHERE status = ?";
            params.push(status);
        }

        const [rows] = await db.query(sql, params);

        return res.status(200).json({
            message: "Screens fetched successfully",
            data: rows
        });

    } catch (err) {
        return res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}


async function getScreenById(req, res) {
    try {
        const id = req.params.id;

        const [rows] = await db.query(
            "SELECT * FROM screen WHERE screen_id = ? AND status = 'active'",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Screen not found"
            });
        }

        return res.status(200).json({
            message: "Screen fetched successfully",
            data: rows[0]
        });

    } catch (err) {
        return res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}

async function getScreenByName(req, res) {
    try {
        const screenName = req.params.screenName;

        const [rows] = await db.query(
            "SELECT * FROM screen WHERE screen_name = ? AND status = 'active'",
            [screenName]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Screen not found"
            });
        }

        return res.status(200).json({
            message: "Screen fetched successfully",
            data: rows[0]
        });

    } catch (err) {
        return res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}

async function deleteScreen(req, res) {
    try {
        const id = req.params.id;

        const [check] = await db.query(
            "SELECT * FROM screen WHERE screen_id = ?",
            [id]
        );

        if (check.length === 0) {
            return res.status(404).json({
                message: "Screen not found"
            });
        }

        await db.query(
            "UPDATE screen SET status = 'deactive' WHERE screen_id = ?",
            [id]
        );

        return res.status(200).json({
            message: "Screen deactivated successfully"
        });

    } catch (err) {
        return res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}

async function updateScreen(req, res) {
    try {
        const id = req.params.id;

        const {
            screen_name,
            capacity,
            screen_type,
            status
        } = req.body;

        const [check] = await db.query(
            "SELECT * FROM screen WHERE screen_id = ?",
            [id]
        );

        if (check.length === 0) {
            return res.status(404).json({
                message: "Screen not found"
            });
        }

        // 🔥 Build dynamic update (safe + flexible)
        let sql = `
            UPDATE screen 
            SET screen_name = ?, capacity = ?, screen_type = ?
        `;

        let params = [
            screen_name,
            capacity,
            screen_type
        ];

        // ✅ only update status if it is provided
        if (status === "active" || status === "deactive") {
            sql += ", status = ?";
            params.push(status);
        }

        sql += " WHERE screen_id = ?";
        params.push(id);

        await db.query(sql, params);

        return res.status(200).json({
            message: "Screen updated successfully"
        });

    } catch (err) {
        return res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}


export default {createScreen,getAllScreens,getScreenById,updateScreen,deleteScreen,getScreenByName};