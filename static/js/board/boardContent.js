window.onload = function () {
    angular.element(document.getElementById("commentDummy")).triggerHandler('click');
}

common.controller('commentController', function ($scope, $http, $compile) {




    $scope.getCommentList = function(key) { 
        let dataObj = {};
        console.log('hi');
        dataObj.key = key;

        $http({
            method:"POST",
            url:"/board/comment/get",
            data:dataObj,
            headers: {'Content-Type': 'application/json; charset=utf-8'}
        }).then(function mySuccess(res) {
             let data = res.data;

             console.log('data : ', data);

             if(data.res) {
                $scope.commentList = data.data;
             }
        }, function myError(res) {
        });
    }

    $scope.writeComment = function(key) {
        let comment = document.getElementById("commentContent").innerHTML;
        console.log('key : ',  key);
        console.log('comment', comment);

        let dataObj = {};

        dataObj.key = key;
        dataObj.content = comment.trim();

        console.log('dataObj : ' ,dataObj);

        $http({
            method:"POST",
            url:"/board/comment/save",
            data:dataObj,
            headers: {'Content-Type': 'application/json; charset=utf-8'}
        }).then(function mySuccess(res) {
             let data = res.data;
             document.getElementById("commentContent").innerHTML = "";
             console.log('data : ', data);

             if(data.res) {
                $scope.getCommentList(key);
             }else {
                 let msg = "댓글 쓰기 실패";
                 if(data.data.reason) {
                     msg += " : " + data.data.reason;
                 }
                 alert(msg);
             }
        }, function myError(res) {
        });
    }
});