const JWT = require('../database/jwt');
const obj = {};

obj.isLogin = (req) => {
    let token = (req.session || {}).userInfo || "";

    if (token) {
        let decoded = JWT.jwtVerify(token) || false;
        if (decoded) {
            return decoded;
        }
        else {
            return false;
        }
    } else {
        return false;
    }
};


module.exports = obj;

