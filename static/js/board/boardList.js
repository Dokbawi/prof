
window.onload = function () {

}

common.controller('boardController', function ($scope, $http, $compile) {
    let showOnePage = 20;
    let countBoardIdx =  Math.floor((document.getElementById("pageNum").value - 1) / 10);

    let pageNum = document.getElementById("pageNum").value - 1;
    let boardMasterId = document.getElementById("boardWrite").getAttribute("href").split('/')[3];
    console.log('pageNum : ', pageNum);
    console.log('countBoardIdx : ', countBoardIdx);

    getBoardList(countBoardIdx, showOnePage , pageNum, true);

    $scope.showBoard = function(idx, event) { 
        window.location.href = "/board/" + boardMasterId + "/page/" + (idx + 1);
    }

    $scope.pageNext = function() {
        countBoardIdx++;
        $scope.showBoard(countBoardIdx * 10);
    }

    $scope.pagePrevious = function() {
        countBoardIdx--;
        if(!countBoardIdx){
            countBoardIdx = 0;
        }
        $scope.showBoard(countBoardIdx * 10);
    }

    function getBoardList(idx, showOnePage, num, isPaging) {
        let dataObj = {};

        dataObj.boardIdx = idx;
        dataObj.showOnePage = showOnePage;
        dataObj.boardId = boardMasterId;
        
        $http({
            method:"POST",
            url:"/board/getBoardList",
            data:dataObj,
            headers: {'Content-Type': 'application/json; charset=utf-8'}
        }).then(function mySuccess(res) {
            let data = res.data;
            let boardData = data.data || [];
            let tempList = [];

            num = num % 10;
            let length = (showOnePage * (num + 1) > boardData.length) ? boardData.length : showOnePage * (num + 1);

            for(let i = num * showOnePage; i < length; i++) {
                let tempObj = {};
                tempObj.head = boardData[i].head || "그냥";
                tempObj.title = boardData[i].boardTitle;
                tempObj.writer = boardData[i].writer;
                tempObj.date = boardData[i].insertDate;
                tempObj.domainShowIdx = boardData[i].domainShowIdx;
                tempList.push(tempObj);
            }
            $scope.boardList = tempList;

            if(isPaging) {
                pageing(boardData.length, showOnePage, idx, num, $scope, $compile);
            }

        }, function myError(res) {
        });
    }

    function pageing(dataLength, showOnePage, idx, num, $scope, $compile) {
        document.getElementById("pagingList").innerHTML = "";

        let text ='<ul class="paging-ul">';
        let textToTag = "";
        let length = (Math.ceil(dataLength / showOnePage) > 10) ? 10 : Math.ceil(dataLength / showOnePage);

        if(idx > 0) {
            text += '<li> <span ng-click="pagePrevious()"><</span></li>';
        }

        for(let i = 0; i < length; i++) {
            let event = 'ng-click="showBoard(' + (i + (idx * 10)) + ', $event)"';
            let className = "";
            if(num == i) {
                className = "cur-active";
                event = "";
            }
            
            text += '<li><span ' + event + ' class="' + className + '">' + (i + 1 + (idx * 10)) + '</span></li>';
        }
        if(length % 10 == 0) {
            text += '<li><span ng-click="pageNext()">></span></li>';
        }

        text += '</ul>';

        textToTag = angular.element(text);

        angular.element(document.getElementById("pagingList")).append($compile(textToTag)($scope));
    }
});
