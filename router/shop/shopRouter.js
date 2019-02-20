module.exports = function (app, firebase) {
    const bodyParser = require('body-parser');
    const common = require('../common.js');
    const multer = require('multer');
    const path = require('path');
    const fs = require('fs');

    let moment = require('moment');

    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());

    const upload = multer({
        limits: {
            fileSize: 5 * 1024 * 1024
        },
        storage: multer.diskStorage({
            destination(req, file, cb) {
                cb(null, 'static/image/shopImage');
            },
            filename(req, file, cb) {
                cb(null, new Date().valueOf() + path.extname(file.originalname));
            }
        })
    });


    app.get('/shop', async (req, res) => {
        res.render('shop/shop.html');
    });

    app.get('/shop/add', async (req, res) => {
        res.render('shop/shopAdd.html');
    });

    app.get('/shop/shoppingBasket', async (req, res) => {
        res.render('shop/shoppingBasket.html');
    });

    app.get('/shop/shopManage', async (req, res) => {
        let auth = common.checkAuth(req);

        auth = 2;


        if (auth == 2) { //임시 방편 권한
            res.render('shop/shopManage.html')
        } else {
            res.redirect('/');
        }
    });

    app.post('/shop/getTagList', async (req, res) => {
        let sendData = {
            res: false,
            data: {}
        };
        let tagList = await firebase.db.ref('shop/tagList').once('value').then(snapshot => {
            let data = snapshot.val();
            let row = [];

            if (data) {
                snapshot.forEach((snapshot) => {
                    let obj = snapshot.val();
                    row.push(obj);
                });
            }

            return row;
        });

        if (tagList) {
            sendData.res = true;
            sendData.data = tagList;
        }
        res.send(sendData);
    });

    app.post('/shop/getShopData', async (req, res) => {
        let sendData = {
            res: false,
            data: {}
        };

        let itemList = await firebase.db.ref('shop/itemList').once('value').then(function (snapshot) {
            let data = snapshot.val();
            let row = [];

            if (data) {
                snapshot.forEach((snapshot) => {
                    let obj = snapshot.val();
                    row.push(obj);
                });
            }

            return row;
        });

        if (itemList) {
            sendData.res = true;
        }
        sendData.data = itemList;
        res.send(sendData);
    });

    app.post('/shop/saveShopItem', upload.single('image'), async (req, res) => {
        let imageSrc = (req.file.destination.replace('static', '')) + '/' + req.file.filename || "";
        let itemName = req.body.name || "";
        let itemTag = JSON.parse(req.body.tagList) || [];
        let itemPrice = req.body.price || 0;

        for (let i = 0; i < itemTag.length; i++) {
            delete itemTag[i]["$$hashKey"];
        }

        let sendData = {
            res: false,
            data: {}
        };

        if (imageSrc && itemName && itemTag && itemPrice) {
            let itemListInfo = firebase.db.ref('shop/itemList');

            let isIn = await itemListInfo.once('value').then(snapshot => {
                return snapshot.forEach(snapshot => {
                    if (snapshot.val().itemName == itemName) {
                        return true;
                    }
                });
            });

            if (isIn) {
                sendData.res = false;
                sendData.data.reason = "이미 존재하는 상품입니다.";
            } else {
                let itemKey = itemListInfo.push().key;
                let itemData = {
                    'key': itemKey,
                    'imageSrc': imageSrc,
                    'itemTag': itemTag,
                    'itemName': itemName,
                    'itemPrice': itemPrice,
                    'insertDate': moment().format('YYYY/MM/DD,HH:mm'),
                };
                firebase.db.ref('shop/itemList/' + itemKey).set(itemData);
                sendData.res = true;
            }
        } else {
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
            data: {}
        };
        if (login) {
            let userKey = await firebase.db.ref('user').orderByChild('id').equalTo(login.id).once('value').then(snapshot => {
                let data = snapshot.val();
                let returnData = "";
                if (data) {
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

            let itemInfo = await firebase.db.ref('shop/itemList/' + shopBasket.key).once('value').then(snapshot => {
                return snapshot.val();
            });

            itemInfo.cnt = shopBasket.cnt;

            if (itemInfo && shopBasket.cnt > 0) {
                let shopBasketKey = firebase.db.ref(dataUrl).push().key;
                let update = {};

                shopBasketList.push(itemInfo);

                let shopBaskeyData = {
                    'key': shopBasketKey,
                    'list': shopBasketList,
                };

                update[dataUrl] = shopBaskeyData;
                firebase.db.ref().update(update);

                sendData.res = true;
            } else {
                sendData.res = false;
                sendData.data.reason = "비정상적인 데이터 입니다.";
            }

        } else {
            sendData.res = false;
            sendData.data.reason = "로그인이 필요한 서비스입니다.";
        }

        res.send(sendData);
    });

    app.post('/shop/getShoppingBasket', async (req, res) => {
        let login = common.isLogin(req);
        let sendData = {
            res: false,
            data: {}
        };

        if (!login) {
            sendData.res = false;
            sendData.data.reason = "로그인이 필요한 서비스입니다.";
        } else {
            let userKey = await firebase.db.ref('user').orderByChild('id').equalTo(login.id).once('value').then(snapshot => {
                let data = snapshot.val();
                let returnData = "";
                if (data) {
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

            if (!shopBasketList) {
                sendData.res = false;
                sendData.data = [];
            } else {
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
            data: {}
        };

        if (!login) {
            sendData.res = false;
            sendData.data.reason = "로그인이 필요한 서비스입니다.";
        } else {
            let userKey = await firebase.db.ref('user').orderByChild('id').equalTo(login.id).once('value').then(snapshot => {
                let data = snapshot.val();
                let returnData = "";
                if (data) {
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

    app.post('/shop/addTag', async (req, res) => {
        let auth = common.checkAuth(req);
        let code = req.body.code;
        let name = req.body.name;
        let sendData = {
            res: false,
            data: {}
        };


        if (auth != 2) {
            sendData.res = false;
            sendData.data.reason = "비이상적인 접근입니다.";
        } else if (!(code && name)) {
            sendData.res = false;
            sendData.data.reason = "데이터 없음";
        } else {
            let tagListUrl = '/shop/tagList';

            let isTag = await firebase.db.ref(tagListUrl).once('value').then(snapshot => {
                let data = snapshot.val();
                let row = [];

                if (data) {
                    snapshot.forEach((snapshot) => {
                        let obj = snapshot.val();
                        row.push(obj);
                    });
                }

                return row;
            });

            isTag = isTag.filter(data => (data.code == code || data.name == name));
            if (isTag.length) {
                sendData.res = false;
                sendData.data.reason = "이미 존재하는 태그입니다";
            } else {
                let tagKey = firebase.db.ref(tagListUrl).push().key;
                let temp = {};
                temp.code = code;
                temp.name = name;
                temp.key = tagKey;

                firebase.db.ref(tagListUrl + '/' + tagKey).set(temp);
                sendData.res = true;
            }
        }
        res.send(sendData);
    })

    app.post('/shop/removeTag', async (req, res) => {
        let auth = common.checkAuth(req);
        let key = req.body.removeTagKey;
        let sendData = {
            res: false,
            data: {}
        };


        if (auth != 2) {
            sendData.res = false;
            sendData.data.reason = "비이상적인 접근입니다.";
        } else {
            let tagListUrl = '/shop/tagList';
            let tagList = await firebase.db.ref(tagListUrl).once('value').then(snapshot => {
                let data = snapshot.val();
                let row = [];

                if (data) {
                    snapshot.forEach((snapshot) => {
                        let obj = snapshot.val();
                        row.push(obj);
                    });
                }

                return row;
            });

            if (!tagList) {
                sendData.res = false;
                sendData.data.reason = "데이터가 존재하지 않음";

            } else {
                let tempList = [];

                tempList = tagList.filter(data => data.key != key);

                if (tempList.length == tagList.length) {
                    sendData.res = false;
                    sendData.data.resaon = "삭제오류";
                } else {
                    let update = {};
                    sendData.res = true;

                    update[tagListUrl] = tempList;
                    firebase.db.ref().update(update);
                }
            }

        }

        res.send(sendData);
    });

    app.post('/shop/getTagList', async (req, res) => {
        let auth = common.checkAuth(req);
        let sendData = {
            res: false,
            data: {}
        };

        if (auth != 2) {
            sendData.res = false;
        } else {
            let tagListUrl = '/shop/tagList';

            let tagList = await firebase.db.ref(tagListUrl).once('value').then(snapshot => {
                let row = []
                if (snapshot.val()) {
                    snapshot.forEach(snapshot => {
                        row.push(snapshot.val());
                    })
                }
                return row;
            });

            if (!tagList) {
                sendData.res = false;
            } else {
                sendData.res = true;
                sendData.data = tagList;
            }
        }
        res.send(sendData);
    });

    app.post('/shop/deleteItem', async (req, res) => {
        let auth = common.checkAuth(req);
        let key = req.body.deleteItemKey;
        let sendData = {
            res: false,
            data: {}
        };

        auth = 2;
        try {


            if (auth != 2) {
                sendData.res = false;
                sendData.data.reason = "비이상적인 접근입니다.";
            } else {
                let shopItemList = await firebase.db.ref('/shop/itemList').once('value').then(snapshot => {
                    let data = snapshot.val();
                    let row = [];

                    if (data) {
                        snapshot.forEach((snapshot) => {
                            let obj = snapshot.val();
                            row.push(obj);
                        });
                    }

                    return row;
                });

                if (!shopItemList) {
                    sendData.res = false;
                    sendData.data.reason = "데이터가 존재하지 않음";

                } else {
                    let tempList = [];
                    let deleteImageUrl = "";

                    tempList = shopItemList.filter(data => data.key == key);
                    deleteImageUrl = (tempList[0] || []).imageSrc || "";
                    if (tempList.length && !deleteImageUrl) {
                        sendData.res = false;
                        sendData.data.resaon = "삭제오류";
                    } else {
                        let update = {};
                        sendData.res = true;
                        update['/shop/itemList/' + tempList[0].key] = {};
                        console.log('deleteImageUrl2 : ', tempList);
                        console.log('deleteImageUrl3 : ', deleteImageUrl);

                        firebase.db.ref().update(update);


                        fs.unlinkSync("static/" + deleteImageUrl.substring(1, deleteImageUrl.length));
                    }
                }

            }
        } catch (error) {

        } finally {
            res.send(sendData);
        }

    });

}
