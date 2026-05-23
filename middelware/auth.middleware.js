import jwt from "jsonwebtoken";

 export function verifyToken(req, res, next) {
    try {
        // 1. Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Access denied. No token provided."
            });
        }

        // 2. Extract token (Bearer <token>)
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Invalid token format"
            });
        }

        // 3. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Attach user info to request
        req.user = decoded;

        // 5. Continue
        next();

    } catch (err) {
        return res.status(401).json({
            message: "Invalid or expired token",
            error: err.message
        });
    }
}




export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            // 1. Check if user data exists
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized. Please login first."
                });
            }

            // 2. Check if user role exists
            if (!req.user.role) {
                return res.status(403).json({
                    success: false,
                    message: "User role not found."
                });
            }

            // 3. Check if user's role is allowed
            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Allowed roles: ${allowedRoles.join(", ")}`
                });
            }

            // 4. Role is authorized
            next();

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Authorization error.",
                error: error.message
            });
        }
    };
};



