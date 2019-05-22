/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable no-alert */
Element.prototype.remove = function () {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
    for (var i = this.length - 1; i >= 0; i--) {
        if (this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}


let common = angular.module('common', ['ngSanitize']);

let domain = window.location.host;
let socket = io.connect(domain);

// $.ajax({
//     url: "/rest/1/pages/245", 
//     data: {
//         name: "홍길동"
//     },
//     method: "GET",
//     dataType: "json"
// }).done(function (result) {

// })





window.onload = function () {
    Init();

}

function Init() {
    event();
}

function event() {

    //resize event
    window.addEventListener('resize', () => {
        let scope = angular.element(document.getElementsByClassName("image-slide")).scope();
        if (scope) {
            scope.$apply(() => {
                scope.updateSize();
            });
        }

    });
}

/*
 *  사용법 :  div.image-slide & controller image-slide 부착
 */
common.controller('image-slider', ($scope) => {
    let imageList = [{
            src: "/image/slideImage.png",
            imageStyle: {}
        },
        {
            src: "/image/slideImage.png",
            imageStyle: {}
        },
        {
            src: "/image/slideImage.png",
            imageStyle: {}
        },
        {
            src: "/image/slideImage.png",
            imageStyle: {}
        },
        {
            src: "/image/slideImage.png",
            imageStyle: {}
        },
    ];

    let tag = "";
    let imageSrc = "/image/";

    let $imageSideDiv = document.getElementsByClassName('image-slide')[0];

    $scope.setSize = function () {
        let $imageSideDiv = document.getElementsByClassName('image-slide')[0];
        imageList[0].divStyle = {
            'z-index': 1,
            "transform": "translateX(-" + $imageSideDiv.offsetWidth * 0.4 + "px) translateX(50%) scale(0.7)"
        };

        imageList[1].divStyle = {
            'z-index': 2,
            "transform": "translateX(-" + $imageSideDiv.offsetWidth * 0.22 + "px) translateX(25%) scale(0.85)"
        };

        imageList[2].divStyle = {
            'z-index': 3,
            "transform": "scale(1);"
        };

        imageList[3].divStyle = {
            'z-index': 2,
            "transform": "translateX(" + $imageSideDiv.offsetWidth * 0.22 + "px) translateX(-25%) scale(0.85)"
        };

        imageList[4].divStyle = {
            'z-index': 1,
            "transform": "translateX(" + $imageSideDiv.offsetWidth * 0.4 + "px) translateX(-50%) scale(0.7)",
        };
    }


    // 0 : left, 1: right
    $scope.slideNext = function (type) {
        let tempList = JSON.parse(JSON.stringify(imageList));
        if (type) {
            for (let i = 1; i < imageList.length; i++) {
                imageList[i].divStyle = tempList[i - 1].divStyle;
            }
            imageList[0].divStyle = tempList[imageList.length - 1].divStyle;
        } else if (!type) {
            for (let i = 0; i < imageList.length - 1; i++) {
                imageList[i].divStyle = tempList[i + 1].divStyle;
            }
            imageList[imageList.length - 1].divStyle = tempList[0].divStyle;
        }
        // $scope.updateSize();
    }


    $scope.updateSize = function () {
        let $imageSideDiv = document.getElementsByClassName('image-slide')[0];
        imageList[0].divStyle.transform = "translateX(-" + $imageSideDiv.offsetWidth * 0.4 + "px) translateX(50%) scale(0.7)";
        imageList[0].divStyle["z-index"] = 1;
        imageList[1].divStyle.transform = "translateX(-" + $imageSideDiv.offsetWidth * 0.22 + "px) translateX(25%) scale(0.85)";
        imageList[1].divStyle["z-index"] = 2;
        imageList[2].divStyle.transform = "scale(1);";
        imageList[2].divStyle["z-index"] = 3;
        imageList[3].divStyle.transform = "translateX(" + $imageSideDiv.offsetWidth * 0.22 + "px) translateX(-25%) scale(0.85)";
        imageList[3].divStyle["z-index"] = 2;
        imageList[4].divStyle.transform = "translateX(" + $imageSideDiv.offsetWidth * 0.4 + "px) translateX(-50%) scale(0.7)";
        imageList[4].divStyle["z-index"] = 1;
    }

    $scope.setSize();
    $scope.imageList = imageList;

});

common.controller('headerController', ($scope, $compile, $http) => {
    loginInfo();
    $scope.registOpen = function () {
        addLoginPopup($compile, $scope);
        let $loginPopup = document.getElementById("loginPopup");
        let $btnList = $loginPopup.querySelector(".tab-list");

        $btnList.children[1].className += " active";
        angular.element($btnList.children[1]).triggerHandler('click');
    }

    $scope.loginOpen = function () {
        addLoginPopup($compile, $scope);
        let $loginPopup = document.getElementById("loginPopup");
        let $btnList = $loginPopup.querySelector(".tab-list");

        $btnList.children[0].className += " active";
        angular.element($btnList.children[0]).triggerHandler('click');
    }

    $scope.logout = function () {
        // console.log('logout');
        // eslint-disable-next-line promise/catch-or-return
        $http({
            method: "POST",
            url: "/user/logout",
            data: {},
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
            // eslint-disable-next-line promise/always-return
        }).then((res) => {
            window.location.href = "/";
        }, (res) => {

        });
    }

    function loginInfo() {
        let $userInfo = document.getElementById("userInfo");

        // console.log($userInfo);
        let innerHtml = "";

        $http({
            method: "POST",
            url: "/user/isLogin",
            data: {},
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        }).then((res) => {
            let data = res.data;

            if (data.res) {
                innerHtml = '<div id="loginUserText" class="float-right">' + data.data.nickName + '님</div> <button class="btn btn-sm" ng-click="logout()">로그아웃</button>';
                socket.emit("joinRooms", res.data.data);
            } else {
                innerHtml = '<button class="btn btn-sm float-right" ng-click="loginOpen()" style="margin-right: 10px;">로그인</button> <button class="btn btn-sm float-right" ng-click="registOpen()">회원가입</button>';
            }

            innerHtml = $compile(angular.element(innerHtml))($scope);
            angular.element($userInfo).append(innerHtml);
            // console.log("DSAD");

        }, (res) => {

        });
    }


});

common.controller('login-popup', ($scope, $http) => {

    $scope.popupClose = function (event) {
        removePopup("loginPopup");
    }

    $scope.tabClick = function (idx) {
        let i = 0;
        let $tabContent = null;
        let $tabBtn = null;

        $tabContent = document.getElementsByClassName("tab-content");
        for (i = 0; i < $tabContent.length; i++) {
            $tabContent[i].style.display = "none";
        }

        $tabBtn = document.getElementsByClassName("tab-btn");
        for (i = 0; i < $tabBtn.length; i++) {
            $tabBtn[i].className = $tabBtn[i].className.replace(" active", "");
        }

        $tabContent[idx].style.display = "flex";
        $tabBtn[idx].className += " active";

    };

    $scope.login = function (event) {
        let $form = findParentByTag(event.target.parentElement, "form");
        let id = document.getElementById("userId").value;
        let pw = document.getElementById("userPw").value;
        let dataObj = {};

        dataObj.id = id;
        dataObj.pw = pw;
        login(dataObj);

    };

    function login(dataObj) {
        $http({
            method: "POST",
            url: "/user/login",
            data: dataObj,
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        }).then(function mySuccess(response) {
            if (!response.data.res) {
                alert('로그인 실패');
            } else {
                document.getElementById("loginPopup").style.visibility = "hidden";
                window.location.href = "/";
            }

        }, (response) => {

        });
    }


    $scope.regist = function (event) {
        let rgId = document.getElementById("registId").value; // 4 ~ 10
        let rgPw = document.getElementById("registPw").value; // 8 ~ 16
        let rgNick = document.getElementById("registNickName").value; //2 ~ 8

        let isRegist = true;

        let dataObj = {};

        if (rgId.length < 4 || rgId.length > 10) {
            $scope.registIdWarning = "4자리 이상, 10자리 이하로 입력하세요.";
            isRegist = false;
        }

        if (rgPw.length < 8 || rgPw.length > 16) {
            $scope.registPwWarning = "8자리 이상, 16자리 이하로 입력하세요.";
            isRegist = false;
        }

        if (rgNick.length < 2 || rgNick.length > 8) {
            $scope.registNickNameWarning = "2자리 이상, 8자리 이하로 입력하세요.";
            isRegist = false;
        }

        if (!isRegist) {
            return;
        } else {
            dataObj.id = rgId;
            dataObj.pw = rgPw;
            dataObj.nickName = rgNick;

            $scope.registIdWarning = "";
            $scope.registPwWarning = "";
            $scope.registNickNameWarning = "";

            // eslint-disable-next-line promise/catch-or-return
            $http({
                method: "POST",
                url: "/user/register",
                data: dataObj,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                }
            }).then((response) => {
                // console.log("res : ", response);

                // eslint-disable-next-line promise/always-return
                if (!response.data.res) {
                    // eslint-disable-next-line no-alert
                    alert('가입 실패 : ' + response.data.data.reason);
                } else {
                    // eslint-disable-next-line no-alert
                    alert('가입 성공');
                    login(dataObj);
                }

            }, (response) => {});
        }

    };
});
common.controller('sideController', ($scope, $http) => {
    getBoard();
    getAuthority();

    $scope.createMyBoard = function () {
        // eslint-disable-next-line promise/catch-or-return
        $http({
            method: "POST",
            url: "/board/createBoard",
            data: {},
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        }).then((res) => {
            let data = res.data;

            // eslint-disable-next-line promise/always-return
            if (data.res) {
                window.location = '/';
            } else {
                let msg = "게시판 생성 실패";
                if (data.data.reason) {
                    msg += " : " + data.data.reason;
                }

                alert(msg);
            }
        }, (response) => {});
    }

    function getAuthority() {
        $http({
            method: "POST",
            url: "/user/isLogin",
            data: {},
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        }).then((res) => {
            let data = res.data;
            if (data.res) {
                $scope.authority = data.authority;
            }
        }, (res) => {

        });
    }


    function getBoard() {
        $http({
            method: "POST",
            url: "/board/getBoard",
            data: {},
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        }).then((res) => {
            let data = res.data;
            if (data.res) {
                setBoard(data.data);
            }
        }, (response) => {});
    }

    function setBoard(data) {
        $scope.boardList = [];
        for (let i = 0; i < data.length; i++) {
            let obj = {};
            obj.boardId = data[i].masterId;
            obj.boardName = data[i].masterName;
            $scope.boardList.push(obj);
        }
    }
});

socket.on('updateInfo', (roomList) => {
    let scope = angular.element(document.getElementById("chat")).scope();
    if (scope) {
        scope.$apply(() => {
            scope.setRoomList();
        });
    }
});

socket.on('answerMakeRoom', (roomId) => {
    let $chatBox = document.getElementById("chatBox");
    let $findUserBox = document.getElementById("findUserBox")
    let scope = angular.element(document.getElementById("chat")).scope();

    $chatBox.style.display = "flex";
    $findUserBox.style.display = "none";

    if (scope) {
        scope.$apply(() => {
            scope.setCurrentRoomId(roomId);
        });
    }

});

socket.on('getToServerMsg', (obj) => {
    //let obj = {}; msg, time, owner
    let scope = angular.element(document.getElementById("chat")).scope();
    if (scope) {
        scope.$apply(() => {
            scope.pushChatData(obj);
        });
    }

});

common.controller('chatController', ($scope, $compile, $http) => {
    $scope.userList = [];
    $scope.chatLogList = [];
    $scope.currentRoomId = "";

    let localMsgData = {};
    getAuthority();

    $scope.openChat = function (userInfo) {
        let $findUserBox = document.getElementById("findUserBox");
        let $chatBox = document.getElementById("chatBox");

        $findUserBox.style.display = "none";
        $chatBox.style.display = "flex";
        socket.emit('makeRoom', userInfo);
    }

    $scope.pushChatData = function (data) {
        //msg, time, owner
        let obj = {};
        obj.content = data.msg;
        obj.time = data.time.slice(11);
        obj.writer = data.owner;

        localMsgData[data.roomId] = localMsgData[data.roomId] || [];
        localMsgData[data.roomId].push(obj);

        $scope.chatLogList = localMsgData[data.roomId];
        setTimeout(() => {
            let scroll = document.getElementById("chatScroll");
            scroll.scrollTop = scroll.scrollHeight;
        }, 50);
    }

    $scope.findUserName = function (value) {
        let result = $.ajax({
            url: "/user/getUserList",
            data: {
                "filter": $scope.filterUserName,
                "withOutMe" : "true"
            },
            method: "POST",
            async: false,
        }).done((result) => {
            return result.data || [];
        }).responseJSON.data || [];

        $scope.userList = result;
    }

    //메신저 박스 오픈
    $scope.toggle = function () {
        $scope.chatLogList = [];
        if ($scope.authority) {
            let $findUserBox = document.getElementById("findUserBox");
            let $chatBox = document.getElementById("chatBox");

            $findUserBox.style.display = "flex";
            $chatBox.style.display = "none";
        } else {
            alert('로그인 후 이용 가능한 서비스 입니다.');
        }

    }

    $scope.setRoomList = function (roomList) {
        $scope.chatFriendsList = roomList;
    };

    $scope.send = function () {
        let text = $scope.chatText;
        $scope.chatText = "";
        document.getElementById("chatInput").focus();
        socket.emit('getToClientMsg', text, $scope.currentRoomId);
    }

    $scope.setCurrentRoomId = function (roomId) {
        $scope.currentRoomId = roomId;
        $scope.chatLogList = localMsgData[roomId];
    }

    function getAuthority() {
        $http({
            method: "POST",
            url: "/user/isLogin",
            data: {},
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        }).then((res) => {
            let data = res.data;
            if (data.res) {
                $scope.authority = data.res;
            }
        }, (res) => {

        });
    }

    $scope.findUserName();

});

function addLoginPopup($compile, $scope) {

    let htmlText = ' <div id="loginPopup" class="pop-close" ng-controller="login-popup"><div ng-click="popupClose($event)" class="popup-close-btn">x</div><div class="pop-main"><div class="tab-list"> <button class="tab-btn" style="border-right: 1px solid #ccc;" ng-click="tabClick(0)">로그인</button>';
    htmlText += '<button class="tab-btn" ng-click="tabClick(1)">회원가입</button></div> <div class="tab-content" style="height: 300px;" > <form class="flex-row"style="width: 100%; " autocomplete="off"><div class="full-width"><div class="left"> <label class="input-label">아이디</label></div>';
    htmlText += '<input id="userId" class="input-sm full-width" type="text" placeholder="아이디를 입력하세요.">  </div><div class="full-width"><div class="left"> <label class="input-label">비밀번호</label></div><input id="userPw" class="input-sm full-width" type="password" placeholder="비밀번호를 입력하세요.">';
    htmlText += '</div><div class="full-width"><button id="loginBtn" class="full-width" ng-click="login($event)"><span>로그인</span></button>  </div></form></div> <div class="tab-content none"> <div class="flex-row full-width">  <form class="flex-row"style="width: 100%; " autocomplete="off" autocomplete="off">';
    htmlText += '<div class="full-width"> <div class="left">  <label class="input-label">아이디(4~10글자)</label> </div> <input id="registId" type="text" class="input-sm full-width"> <div class="left">  <label class="input-label warning">{{registIdWarning}}</label> </div></div> <div class="full-width"> <div class="left">';
    htmlText += ' <label class="input-label">비밀번호(8~16)</label> </div> <input id="registPw" type="password" class="input-sm full-width"> <div class="left">  <label class="input-label warning">{{registPwWarning}}</label> </div></div> <div class="full-width"> <div class="left">  <label class="input-label">닉네임(2~8이하)';
    htmlText += '</label> </div> <input id="registNickName" type="text" maxlength="10" class="input-sm full-width"> <div class="left">  <label class="input-label warning">{{registNickNameWarning}}</label> </div></div> <div class="full-width"> <button id="registBtn" class="full-width" ng-click="regist($event)"><span>가입하기</span></button></div>  </form> </div></div></div> </div>';
    removePopup("loginPopup");
    addPopup(angular.element(htmlText), $compile, $scope);
}


function addPopup(element, $compile, $scope) {
    angular.element(document.getElementById("popupDiv")).append($compile(element)($scope));
}

function removePopup(id) {
    let $ele = document.getElementById("popupDiv").querySelector("#" + id);
    if ($ele) {
        $ele.remove();
    }
}

function merge(a, b, prop) {
    var reduced = a.filter(aitem => !b.find(bitem => aitem[prop] === bitem[prop]))
    return reduced.concat(b);
}

function findParentByClass(el, cls) {
    while ((el = el.parentElement) && !el.classList.contains(cls));
    return el;
}

function findParentByTag(el, tagName) {
    tagName = tagName.toLowerCase();

    while (el && el.parentNode) {
        el = el.parentNode;
        if (el.tagName && el.tagName.toLowerCase() == tagName) {
            return el;
        }
    }

    // Many DOM methods return null if they don't
    // find the element they are searching for
    // It would be OK to omit the following and just
    // return undefined
    return null;
}


function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
