/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */

module.exports = function(app, firebase) {
    const bodyParser = require('body-parser');
    const common = require('./common.js');
    const JWT = require('../database/jwt.js');
    let moment = require('moment') ;

    const boardRouter = require('./board/board.js')(app,firebase);
    const shopRouter = require('./shop/shopRouter.js')(app,firebase);

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    app.get('/', (req, res)=> {  
        console.log('session : ', req.session);
        res.render('index.html');
    }); 

    app.post('/user/login', (req, res)=> {
        let id = req.body.id;
        let pw = req.body.pw;
        let userInfo = firebase.db.ref('user');
        let sendData = {
            res: false,
            data : {}
        };
        let tokenData = {};
        let token;

        userInfo.once('value').then((snapshot) => {
            snapshot.forEach((snapshot) => {
                let data = snapshot.val();
                let tempId = data.id; 
                let tempPw = data.pw;

                if(tempId == id && tempPw == pw) {
                    sendData.res = true;
                    tokenData.id = id;
                    tokenData.nickName = data.nickName;
                    return true;
                }
            });

        }).then(() => {
            if(sendData.res) {
                token = JWT.jwtSign(tokenData);
                req.session.userInfo = token;
            }
            res.status(200).send(sendData);
        });
        
    });

    app.post('/user/register', (req,res)=>{
        let id = req.body.id;
        let pw = req.body.pw;
        let nickName = req.body.nickName;
        let userInfo = firebase.db.ref('user');
        let sendData = {
            res: true,
            data : {}
        };

        userInfo.once('value').then((snapshot) => {
            snapshot.forEach((snapshot) => {
                let data = snapshot.val();
                if(id == data.id) {
                    sendData.data.reason = "아이디 중복";
                    sendData.res = false;
                    return true;
                }
            });
        }).then(() => {
            if(sendData.res) {
                let key = userInfo.push().key;
                let userData = {};
                userData.id = id;
                userData.key = key;
                userData.pw = pw;
                userData.nickName = nickName;
                userData.insertDate = moment().format('YYYY/MM/DD HH:mm');
                firebase.db.ref('user/'+key).set(userData);
            }
            res.send(sendData);
        });
    }); 

    app.post('/user/logout', (req, res) => {
        req.session.destroy((err) =>{
            if(err){
                console.log(err);
                res.send(false);

            }else{
                res.send(true);
            }
        });
    });

    app.post('/user/isLogin', (req, res) => {
        let sendData = {
            res: false,
            data : {}
        };
        let data = common.isLogin(req);
        if(data) {
            sendData.res = true;
            sendData.data = data;
        }
        res.send(sendData);
    });

}



