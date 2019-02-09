
module.exports = function(app, firebase) {
    const bodyParser = require('body-parser');
    const common = require('../common.js');
    const multer = require('multer');
    const path = require('path');

    let moment = require('moment');

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    const upload = multer({
        limits: { fileSize: 5 * 1024 * 1024 },
        storage: multer.diskStorage({
          destination(req, file, cb) {
            cb(null, 'static/image/shopImage'); 
          },
          filename(req, file, cb) {
            cb(null, new Date().valueOf() + path.extname(file.originalname));
          }
        })
    });

 
    app.get('/shop',  async (req, res) => {
        res.render('shop/shop.html');
    });

    app.get('/shop/add',  async (req, res) => {
        res.render('shop/shopAdd.html');
    });

    app.get('/shop/shoppingBasket',  async (req, res) => {
        res.render('shop/shoppingBasket.html');
    });

    app.post('/shop/getTagList', async (req, res) => {
        let sendData = {
            res: false,
            data : {}
        };
        let tagList = await firebase.db.ref('shop/tagList').once('value').then(snapshot => {
            let data = snapshot.val();
            let row =[];

            if(data) {
                snapshot.forEach((snapshot) => {
                    let obj = snapshot.val();
                    row.push(obj);
                });
            }

            return row;
        });

        if(tagList) {
            sendData.res = true;
            sendData.data = tagList;
        }
        res.send(sendData);        
    });

    app.post('/shop/getShopData', async (req, res) => {
        let sendData = {
            res: false,
            data : {}
        };

        let itemList = await firebase.db.ref('shop/itemList').once('value').then(function(snapshot){
            let data = snapshot.val();
            let row =[];

            if(data) {
                snapshot.forEach((snapshot) => {
                    let obj = snapshot.val();
                    row.push(obj);
                });
            }

            return row;
        });

        if(itemList) {
            sendData.res = true;
        }
        sendData.data = itemList;
        res.send(sendData);
    });

    app.post('/shop/saveShopItem', upload.single('image'), async (req, res) => {
        let imageSrc = (req.file.destination.replace('static','')) + '/' + req.file.filename || "";
        let itemName = req.body.name || "";
        let itemTag = JSON.parse(req.body.tagList) || [];
        let itemPrice = req.body.price || 0;

        for(let i = 0; i < itemTag.length; i++) {
            delete itemTag[i]["$$hashKey"];
        }

        let sendData = {
            res: false,
            data : {}
        };

        if(imageSrc && itemName && itemTag && itemPrice) {
            let itemListInfo = firebase.db.ref('shop/itemList');

            let isIn = await itemListInfo.once('value').then(snapshot=> {
                return snapshot.forEach(snapshot=> {
                    if(snapshot.val().itemName == itemName) {
                        return true;
                    }
                });
            });

            if(isIn){
                sendData.res = false;
                sendData.data.reason = "이미 존재하는 상품입니다.";
            }else {
                let itemKey = itemListInfo.push().key;
                let itemData = {
                    'key' : itemKey,
                    'imageSrc' : imageSrc,
                    'itemTag' : itemTag,
                    'itemName' : itemName,
                    'itemPrice' : itemPrice,
                    'insertDate' : moment().format('YYYY/MM/DD,HH:mm'),
                };
                firebase.db.ref('shop/itemList/' + itemKey).set(itemData);
                sendData.res = true;
            }
        }else {
            sendData.res = false;
            sendData.data.reason = "데이터가 없습니다.";
        }

        res.send(sendData);
    });

    app.post('/shop/addShoppingBasket', async (req, res) => {
        let shopBasket = req.body.shopBasket;
        let login = common.isLogin(req);
        let sendData = {
            res: false,
            data : {}
        };
        if(login) {
            let userKey = await firebase.db.ref('user').orderByChild('id').equalTo(login.id).once('value').then(snapshot => {
                let data = snapshot.val();
                let returnData = "";
                if(data) {
                    data = data[Object.keys(data)[0]];
                    returnData = data;
                }
                return returnData.key;
            });
            let dataUrl = 'shop/shoppingBasket/' + userKey;

            let shopBasketList = await firebase.db.ref(dataUrl).once('value').then(snapshot => {
                let data = snapshot.val() || {};
                console.log('data :' , data);
                return data.list || [];
            });

            let itemInfo = await firebase.db.ref('shop/itemList/' + shopBasket.key).once('value').then(snapshot=> {
                return snapshot.val();
            });

            itemInfo.cnt = shopBasket.cnt;

            if(itemInfo && shopBasket.cnt > 0) {
                let shopBasketKey = firebase.db.ref(dataUrl).push().key;
                let update = {};
                console.log('shopBasketList : ' , shopBasketList);
            
                shopBasketList.push(itemInfo);

                let shopBaskeyData = {
                    'key' : shopBasketKey,
                    'list' : shopBasketList,
                };
    
                update[dataUrl] = shopBaskeyData;
                firebase.db.ref().update(update);

                sendData.res = true;
            }else {
                sendData.res = false;
                sendData.data.reason = "비정상적인 데이터 입니다.";
            }
         
        }else {
            sendData.res = false;
            sendData.data.reason = "로그인이 필요한 서비스입니다.";
        }

        res.send(sendData);
    });

    app.post('/shop/getShoppingBasket', async (req, res) => {
        let login = common.isLogin(req);
        let sendData = {
            res: false,
            data : {}
        };

        if(!login) {
            sendData.res = false;
            sendData.data.reason = "로그인이 필요한 서비스입니다.";
        }else{
            let userKey = await firebase.db.ref('user').orderByChild('id').equalTo(login.id).once('value').then(snapshot => {
                let data = snapshot.val();
                let returnData = "";
                if(data) {
                    data = data[Object.keys(data)[0]];
                    returnData = data;
                }
                return returnData.key;
            });

            let dataUrl = 'shop/shoppingBasket/' + userKey;

            let shopBasketList = await firebase.db.ref(dataUrl).once('value').then(snapshot => {
                let data = snapshot.val() || {};
                return data.list || [];
            });

            if(!shopBasketList){
                sendData.res = false;
                sendData.data = [];
            }else {
                sendData.res = true;
                sendData.data = shopBasketList;
            }
        }

        res.send(sendData);
    });

    app.post('/shop/payShoppingBasket', async (req, res) => {
        let login = common.isLogin(req);
        let sendData = {
            res: false,
            data : {}
        };

        if(!login) {
            sendData.res = false;
            sendData.data.reason = "로그인이 필요한 서비스입니다.";
        }else{
            let userKey = await firebase.db.ref('user').orderByChild('id').equalTo(login.id).once('value').then(snapshot => {
                let data = snapshot.val();
                let returnData = "";
                if(data) {
                    data = data[Object.keys(data)[0]];
                    returnData = data;
                }
                return returnData.key;
            });

            let update = {};

            let dataUrl = 'shop/shoppingBasket/' + userKey;

            update[dataUrl] = {};
            firebase.db.ref().update(update);
            sendData.res = true;
            sendData.data = "실제로 결제되지 않습니다.";
        }

        res.send(sendData);
    });

}



