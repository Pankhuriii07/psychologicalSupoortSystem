const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    // 1. Browser se token mangwana (Request header se)
    const token = req.header('Authorization')?.replace("Bearer ", "");

    // 2. Agar token nahi hai
    if (!token) {
        return res.status(401).json({ msg: "No token, login zaroori hai!" });
    }

    try {
        // 3. Token ko verify karna (Secret key ke saath)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. User ki info request object mein daal dena taaki aage use ho sake
        req.user = decoded;
        
        // 5. Agle function par jao
        next();
    } catch (err) {
        res.status(401).json({ msg: "Token sahi nahi hai!" });
    }
};

module.exports = auth;