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


// 0 not login , 1 user , 2 admin
obj.checkAuth = (req) => {
    let login = obj.isLogin(req);
    let level = 0;
    if(!login){
        level = 0;
    }else {
        if(login.id == 'admin') {
            level = 2;
        }else{
            level = 1;
        }
    }

    return level;
}


module.exports = obj;

