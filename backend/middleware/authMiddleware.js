const jwt = require("jsonwebtoken");


function verifyAdmin(req, res, next) {

    const authorization =
        req.headers.authorization;
    
    

    if (!authorization) {

        return res.status(401).json({

            message: "Authentication required"

        });

    }


    const parts = authorization.split(" ");


    if (
        parts.length !== 2 ||
        parts[0] !== "Bearer"
    ) {

        return res.status(401).json({

            message: "Invalid authorization format"

        });

    }


    const token = parts[1];


    try {

        if (!process.env.JWT_SECRET) {

            throw new Error("JWT_SECRET is not configured");

        }


        const decoded = jwt.verify(

            token,

            process.env.JWT_SECRET,

            {

                issuer: "smart-library"

            }

        );

        console.log("JWT verification successful");
        console.log("User role:", decoded.role);


        if (decoded.role !== "admin") {

            return res.status(403).json({

                message: "Administrator access required"

            });

        }


        req.admin = decoded;


        next();


    } catch (error) {

    

    return res.status(401).json({

        message: "Invalid or expired login session"

    });

}
}


module.exports = verifyAdmin;