/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */

module.exports = function (app, firebase, io) {
    let moment = require('moment');
    const common = require('../common.js');

    io.on('connection', (socket) => {
        console.log('socket on ');

        socket.on('joinRooms', async (userData) => {
            socket.RealId = userData.socketId || "";
            socket.userInfo = userData;
            let roomList = await common.dbGetAllDataToList(firebase, {"src" : '/room/' + userData.key});

            if(roomList) {
                for(let i = 0; i < roomList.length; i++) {
                    socket.join(roomList[i].roomId);
                }
            }

            socket.emit('updateInfo', roomList);
        });

        socket.on('getToClientMsg', (msg, roomId) => {
            let obj = {};
            obj.msg = msg;
            obj.time = moment().format('YYYY/MM/DD,HH:mm');
            obj.owner = socket.userInfo.nickName;
            obj.roomId = roomId;
            console.log('getToClientMsg : ', obj);
            io.to(roomId).emit('getToServerMsg', obj);
        });


        socket.on('makeRoom', async (otherInfo) => {
            // let otherInfo = await common.dbGetData(firebase, {
            //     "data" : otherUserId,
            //     "url" : "user",
            //     "orderId": "id"
            // });
            // let roomId = "";

            // let otherInfo = otherUserId;

            let result = false;
            
            if(socket.userInfo.socketId > otherInfo.socketId) {
                roomId = socket.userInfo.socketId + "" + otherInfo.socketId;
            }else {
                roomId = otherInfo.socketId + "" + socket.userInfo.socketId;
            }

            let isExistRoom = await common.dbGetData(firebase, {
                "data" : roomId,
                "url" : "/room",
                "orderId": "roomId"
            });

            if(isExistRoom) {
                console.log('이미 존재하는 방입니다.');
            }else {
                let obj = {};
                obj.roomId = roomId;
                obj.insertDate = moment().format('YYYY/MM/DD,HH:mm');
                common.dbSaveNewData(firebase,'room/' + socket.userInfo.key, obj);
                common.dbSaveNewData(firebase,'room/' + otherInfo.key, obj);
                result = true;
            }
            socket.to(otherInfo.socketId).emit('joinRoom', roomId);
            socket.emit('answerMakeRoom', roomId);
        });

        // socket.on('서버에서 받을 이벤트명', (데이터) => {
        //     // 받은 데이터 처리
        //     socket.emit('서버로 보낼 이벤트명', 데이터);

        //     socket.broadcast.emit('이벤트명', 데이터); //나를 제외한 전체

        //     socket.join(방의 아이디); // 그룹에 들어가기
        //     socket.leave(방의 아이디); // 그룹 떠나기

        //     io.to(방의 아이디).emit('이벤트명', 데이터); // 그룹 전체
        //     socket.broadcast.to(방의 아이디).emit('이벤트명', 데이터); // 나를 제외한 그룹 전체
        // });





        socket.on('disconnect', () => { //3-2
            console.log('user disconnected: ', socket.id);
        });
    });
 
}
