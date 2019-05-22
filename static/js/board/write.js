common.controller('writeController', function ($scope, $http, $compile) {


    $scope.writeSubmit = function(url) {
        let content = document.getElementById("writeView").innerHTML;

        let dataObj = {};

        dataObj.boardTitle = $scope.boardTitle;
        dataObj.boardContent = content;

        $http({
            method:"POST",
            url:url,
            data:dataObj,
            headers: {'Content-Type': 'application/json; charset=utf-8'}
        }).then(function mySuccess(res) {
             let data = res.data;

             if(data.res) {
               location.href= data.data.domain;
             }else{
                let fail = "글쓰기 실패";
                if(data.res.reason) {
                    fail += "  " + data.res.reason;
                }
                alert(fail);
             }

        }, function myError(res) {
        });
    }


    function test() {
        let url = '/board/admin/write';
        let cnt = 0;
        setInterval( function () {
            let dataObj = {};

            dataObj.boardTitle = '글테스틍 ' + cnt;
            dataObj.boardContent = '글내용테스트 ' + cnt;
    
            $http({
                method:"POST",
                url:url,
                data:dataObj,
                headers: {'Content-Type': 'application/json; charset=utf-8'}
            }).then(function mySuccess(res) {
                cnt++;
    
            }, function myError(res) {
            });
        },1000);
    }


});
