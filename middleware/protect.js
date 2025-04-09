const jwt = require("jsonwebtoken");

async function protect(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.authToken;

    if (token) {
      jwt.verify(token, process.env.JWTPRIVATEKEY, {}, (err, userData) => {
        if (err) {
          reject("Invalid token");
        } else {
          resolve(userData);
        }
      });
    } else {
      reject("No token provided");
    }
  });
}

module.exports = protect;
