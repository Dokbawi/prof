
module.exports = function(app, firebase) {
    const bodyParser = require('body-parser');
    const common = require('../common.js');
    const cookieParser = require('cookie-parser');
    
    let moment = require('moment');
    let dateToIdxNum = 12040600400300;

    app.use(bodyParser.json());
    app.use(cookieParser());

    app.get('/board/:id', async (req, res) => { 
        let id = req.params.id;
        let renderUrl = 'board/boardList.html';
        let renderData = {};

        let masterKey = await firebase.db.ref('user').orderByChild('id').equalTo(id).once('value').then(function(snapshot){
            let data = snapshot.val();
            let returnData = "";
            if(data) {
                data = data[Object.keys(data)[0]];
                returnData = data.key;
                renderData.boardMasterNickName = data.nickName;
                renderData.boardMasterId = data.id;
            }
            return returnData;
        });

        let boardKey = await firebase.db.ref('board/userBoardInfo').orderByChild('masterKey').equalTo(masterKey).once('value').then(function(snapshot) {
            let data = snapshot.val();
            let returnData = "";
            if(data) {
                data = data[Object.keys(data)[0]];
                returnData = data.key;
            }
            return returnData
        });

        if(!(masterKey && boardKey)) {
            res.redirect('/');
        }else{
            res.render(renderUrl, renderData);
        }
    });

    app.get('/board/write/:id', async (req, res) => {
        let id = req.params.id;
        let login = common.isLogin(req);

        let userInfo = await firebase.db.ref('user').orderByChild('id').equalTo(id).once('value').then(function(snapshot){
            let data = snapshot.val();
            let returnData = "";
            if(data) {
                data = data[Object.keys(data)[0]];
                returnData = data;
            }
            return returnData
        });

        if(!login) {
            res.redirect('/board/' + id);
        }else {
            res.render('board/write.html',{
                "boardMasterNickName" : userInfo.nickName,
                "boardMasterId" : userInfo.id,
            });
        }

    });
 
    app.post('/board/createBoard',  async (req, res) => {
        let login = common.isLogin(req);
        let sendData = {
            res: false,
            data : {}
        };

        if(login) {
            let userInfo = firebase.db.ref('/user');
            let userKey = "";
            let userNickName = "";
            let userId = "";
            await userInfo.once('value').then(function(snapshot) {
                snapshot.forEach(function (snapshot) {
                    let data = snapshot.val();
                    if(login.id == data.id) {
                        userKey = snapshot.key;
                        userId = data.id;
                        userNickName = data.nickName;
                        return true;
                    }
                });
            }).then(async function(snapshot) {
                let boardInfo = firebase.db.ref('/board/userBoardInfo');

                let isAlreayCreate = await boardInfo.orderByChild('masterKey').equalTo(userKey).once('value').then(function(snapshot){
                    if(snapshot.val()){
                        sendData.res = false;
                        sendData.data.reason = "이미 생성된 유저의 게시판 입니다.";
                        return true;
                    }
                    return false;
                });

                if(!isAlreayCreate){
                    let key = boardInfo.push().key;

                    let boardInfoData = {
                        'key' : key,
                        'masterKey' : userKey,
                        'masterName' : userNickName,
                        'masterId' : userId,
                        'insertDate' : moment().format('YYYY/MM/DD HH:mm'),
                        'boardList' : {},
                    }
                    firebase.db.ref('/board/userBoardInfo/' + key).set(boardInfoData);
                    sendData.res = true;
                }
                
                res.send(sendData);
            });
        }else {
            sendData.false;
            sendData.data.reason = "로그인이 필요한 서비스 입니다.";
            res.send(sendData);
        }
    });

    app.post('/board/:id/write', async (req, res) => {
        let boardId = req.params.id;
        let boardTitle = req.body.boardTitle;
        let boardContent = req.body.boardContent;
        let login = common.isLogin(req);

        let sendData = {
            res: false,
            data : {}
        };

        if(!login){
            sendData.res = false;
            res.send(sendData);
        }else {
            let userInfo = firebase.db.ref('/user');
            let boardInfo = firebase.db.ref('/board/userBoardInfo');
            let writerKey = "";
            let writer = "";
            

            userInfo.once('value').then(function(snapshot) {
                snapshot.forEach(function (snapshot) {
                    let data = snapshot.val();
                    if(login.id == data.id) {
                        writerKey = data.key;
                        writer = data.nickName;
                        return true;
                    }
                });
                 
            }).then(async function() {

                let boardKey = await boardInfo.orderByChild('masterId').equalTo(boardId).once('value').then(function(snapshot) {
                    let data = snapshot.val();
                    let returnData = "";
                    if(data) {
                        data = data[Object.keys(data)[0]];
                        returnData = data.key;
                    }
                    return returnData
                });

                boardInfo.orderByChild('key').equalTo(boardKey).once('value').then(function(snapshot) {
                    if(!snapshot.val()){
                        sendData.res = false;
                        sendData.data.reason = "잘못된 접근입니다.";
                    }else{
                        let boardListInfo = firebase.db.ref('/board/boardList');
                        let key = boardListInfo.push().key;
                        firebase.db.ref('/board/boardList/' + boardKey + '/' + key).set({
                            "key" : key,
                            "boardTitle" : boardTitle,
                            "boardContent" : boardContent,
                            'insertDate' : moment().format('YYYY/MM/DD HH:mm'),
                            "boardComment" : {},
                            "writerKey" : writerKey,
                            "writer" : writer,
                            "domainShowIdx" : moment().format('YYYYMMDDHHmmssSS') - dateToIdxNum,
                        });
    
                        sendData.res = true;
                        sendData.data.domain = '/board/' + boardId; // 수정요망 작성된 글 보는걸로
                    }
                    
                    res.send(sendData);
                });
            });
        }

    });

    app.post('/board/delete', (req, res) => {
        let boardKey = req.body.boardKey;
        let boardListKey = req.body.boardListKey;
        let login = common.isLogin(req);

        let sendData = {
            res: false,
            data : {}
        };
        if(!boardKey || !login){
            sendData.res = false;
        }else {
            let userInfo = firebase.db.ref('/user');
            let boardListInfo = firebase.db.ref('/board/' + boardKey + '/boardList/' + boardListKey);
            let userKey = "";

            userInfo.once('value').then(function(snapshot) {
                snapshot.forEach(function (snapshot) {
                    let data = snapshot.val();
                    if(login.id == data.id) {
                        userKey = snapshot.key;
                        return true;
                    }
                });
                 
            }).then(function() {
                boardListInfo.once('value').then(function(snapshot) {
                    if(userKey == snapshot.val().userKey) {
                        sendData.res = true;
                        boardListInfo.set({});
                    }
                    res.send(sendData);
                });
                
            });
        }
    });

    app.post('/board/comment', (req, res) => {
        let boardKey = req.body.boardKey;
        let boardListKey = req.body.boardListKey;
        let commentContent = req.body.commentContent;
        let login = common.isLogin(req);

        let sendData = {
            res: false,
            data : {}
        };

        if(!boardKey || !login){
            sendData.res = false;
        }else {
            let userInfo = firebase.db.ref('/user');

            let boardListInfo = firebase.db.ref('/board/' + boardKey + '/boardList/' + boardListKey);
            let userKey = "";
            let userNickName = "";

            userInfo.once('value').then(function(snapshot) {
                snapshot.forEach(function (snapshot) {
                    let data = snapshot.val();
                    if(login.id == data.id) {
                        userKey = snapshot.key;
                        userNickName = data.nickName;
                        return true;
                    }
                });
                 
            }).then(function() {
                boardListInfo.once('value').then(function(snapshot) {
                    if(userKey == snapshot.val().userKey) {
                        sendData.res = true;
                        let key = boardListInfo.push().key;

                        firebase.db.ref('/board/' + boardKey + '/boardList/' + boardListKey + '/boardComment/' + key).set({
                            "key" : key,
                            "writeUserKey" : userKey,
                            "commentContent" : commentContent,
                            "insertDate" : moment().format('YYYY/MM/DD HH:mm'),
                            "writeUserName" : userNickName
                        });
                    }
                    res.send(sendData);
                });
                
            });
        }
    });

    app.post('/board/getBoardList', async (req, res) => {
        let boardIdx = req.body.boardIdx;
        let showOnePage = req.body.showOnePage;
        let boardId = req.body.boardId;
        let sendData = {
            res: false,
            data : [],
        };
        

        let boardKey = await firebase.db.ref('board/userBoardInfo').orderByChild('masterId').equalTo(boardId).once('value').then(function(snapshot) {
            let data = snapshot.val();
            let returnData = "";
            if(data) {
                data = data[Object.keys(data)[0]];
                returnData = data.key;
            }
            return returnData
        });

        let boardListDB = firebase.db.ref('/board/boardList/' + boardKey);

        let boardList = await boardListDB.orderByChild('insertDate').once('value').then(snap => {
            let row = [];

            snap.forEach(snap => {
                let obj = {};
                let date = snap.val().insertDate;
                date = moment(date);

                if(moment().isSame(new Date(snap.val().insertDate), 'day')) {
                    date = date.format('HH:mm');
                }else {
                    date = date.format('MM-DD');
                }

                obj.boardTitle = snap.val().boardTitle;
                obj.domainShowIdx = snap.val().domainShowIdx;
                obj.insertDate =  date;
                obj.writer =  snap.val().writer;
                row.push(obj);
            });

            row = row.reverse();

            return row.slice(boardIdx * 10 * showOnePage, ((boardIdx + 1) * 100 > row.length) ? row.length : (boardIdx + 1) * 10 * showOnePage);
        });;

        if(boardList){
            sendData.data = boardList;
            sendData.res = true;
        }

        res.send(sendData);
    });

    app.get('/boardList/:idx', async (req, res) => {
        let boardNum = req.params.idx;
        let renderData = {};
        let renderUrl = "";

 
        let boardList = await firebase.db.ref('/board/boardList').once('value').then(function(snapshot){
            let data = snapshot.val();
            
            return data;
        });

        boardList = showBoardContent(boardList, boardNum);


        boardList.boardContent =textToHtml(boardList.boardContent);

        if(boardList) {
            renderUrl = 'board/boardContent.html';
            renderData.boardContent = boardList.boardContent;
            renderData.boardMasterNickName = boardList.writer;
            renderData.boardTitle = boardList.boardTitle;
            renderData.boardKey = boardList.key;
            res.render(renderUrl, renderData);
        }else {
            res.redirect('/');
        }

    });

    app.post('/board/comment/save', async (req, res) => {
        let key = req.body.key;
        let content = req.body.content;
        let login = common.isLogin(req);
        let sendData = {
            res: false,
            data : {}
        };

        if(login && content){
            let commentInfo = firebase.db.ref('/board/comment/' + key);
            let commentKey = commentInfo.push().key;
            let commentData = {
                'key' : commentKey,
                'boardKey' : key,
                'content' : content,
                'writer' : login.nickName,
                'insertDate' : moment().format('YYYY/MM/DD HH:mm'),
            }
            let url = '/board/comment/' + key + '/' + commentKey;
            firebase.db.ref(url).set(commentData);
            sendData.res = true;
        }else if(!login) {
            sendData.data.reason = "로그인 서비스입니다.";
        }else if(!content) {
            sendData.data.reason = "댓글 내용이 없습니다.";
        }

        res.send(sendData);
    });

    app.post('/board/comment/get', async (req, res) => {
        let key = req.body.key;
        let sendData = {
            res: false,
            data : {}
        };

        let comments = await firebase.db.ref('/board/comment/' + key).once('value').then(snap => {
            let row = [];
            snap.forEach(snap=> {
                let obj = snap.val();
                obj.content = textToHtml(obj.content);

                row.push(obj);
            });
            return row;
        });


        // console.log('comment', comments);

        if(!comments) {
            sendData.data.reason = "데이터 없음";
        }else{
            sendData.data = comments;
            sendData.res = true;
        }

        res.send(sendData);
    });

    // 생성된 게시판 데이터 가져옴
    app.post('/board/getBoard', async (req, res) => {
        let sendData = {
            res: false,
            data : [],
        };

        let boardList = await firebase.db.ref('/board/userBoardInfo').once('value').then(snap => {
            let row = [];
            snap.forEach(snap => {
                row.push(snap.val());
            });
            return row;
        });

        if(boardList){
            sendData.res = true;
            sendData.data = boardList;
        }

        res.send(sendData);
    });

    function textToHtml(text) {
        text = text.trim();
        text = text.replace(/<div>/gi,"\n");
        text = text.replace(/<\/div>/gi,"");
        return text;
    }
    
    function showBoardContent(data, value) {
        let temp = {};
        for(let key1 in data) {
            let isRe = false;
            for(let key2 in data[key1]) {
                if(data[key1][key2].domainShowIdx == value) {
                    isRe = true;
                    temp = data[key1][key2];
                    break;
                }
            }
            if(isRe){
                break;
            }
        }

        return temp;
    }
 
    

}



