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


obj.dbGetData = async (firebase, obj) => {
    console.log('dbGetData : ', obj);
    let data = await firebase.db.ref(obj.url).orderByChild(obj.orderId).equalTo(obj.data).once('value').then((snapshot) =>{
        let data = snapshot.val();
        let returnData = "";
        if(data) {
            data = data[Object.keys(data)[0]];
            returnData = data;
        }
        return returnData;
    });
    return data;
}

obj.dbSaveNewData = async (firebase, src, obj) => {
    let key = firebase.db.ref(obj.url).push().key;
    obj.key = key;
    firebase.db.ref(src + '/' + key).set(obj);
    return true;
}

obj.dbGetAllDataToList = async (firebase, obj) => {
    console.log('dbGetAllDataToList : ', obj)
    let list = await firebase.db.ref(obj.src).once('value').then(snapshot=> {
        let row = [];
        if(snapshot.val()) {
            snapshot.forEach(snapshot=>{
                let temp = {};
                obj.keyList = obj.keyList || [];
                if(obj.keyList.length){
                    for(let i = 0; i < obj.keyList.length; i++ ) {
                        let tempKey = obj.keyList[i];
                        temp[tempKey] = snapshot.val()[tempKey];
                    }
                }else{
                    temp = snapshot.val();
                }
                row.push(temp); 
            })
        }
        return row;
    });
    return list;
}



module.exports = obj;

