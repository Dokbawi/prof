let jwt = require("jsonwebtoken");
const jwtSecretKey = "dsad!#@13212DSafsaE@!13adsa";


let jwtSign = (token) => {
  return jwt.sign(token, jwtSecretKey,
    {
      expiresIn: '60m'
    });
}

let jwtVerify = (token) => {
  return jwt.verify(token, jwtSecretKey, (err, decoded) => {
    if (err) return false;
    return decoded;
  })
}


exports.jwtSecretKey = jwtSecretKey;
exports.jwtSign = jwtSign;
exports.jwtVerify = jwtVerify;
exports.jwt = jwt;