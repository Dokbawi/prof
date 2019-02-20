window.onload = function () {

}

common.controller('shopManageController', function ($scope, $http, $compile) {
  getShopData();
  getTagData();

  $scope.addTag = (data) => {
    let dataObj = {};
    let $code = document.getElementById('tagCode');
    let $name = document.getElementById('tagName');
    dataObj.code = $code.value;
    dataObj.name = $name.value;

    console.log('dataObj :  ' ,dataObj)
    $http({
      method: "POST",
      url: "/shop/addTag",
      data: dataObj,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    }).then(function mySuccess(res) {
      let data = res.data;

      console.log('datga : ' , data);
      if (data.res) {
        getTagData();
        $name.value = "";
        $code.value = "";
      } else {
        let msg = "삭제 실패";
        if (data.data.reason) {
          msg += ": " + data.data.reason;
        }
        alert(msg);
      }
    }, function myError(res) {});
  }

  $scope.removeTag = (data) => {
    console.log('removeTag : ', data);
    let dataObj = {};

    dataObj.removeTagKey = data.key;

    $http({
      method: "POST",
      url: "/shop/removeTag",
      data: dataObj,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    }).then(function mySuccess(res) {
      let data = res.data;
      if (data.res) {
        getTagData();
      } else {
        let msg = "삭제 실패";
        if (data.data.reason) {
          msg += ": " + data.data.reason;
        }
        alert(msg);
      }
    }, function myError(res) {});
  }

  $scope.deleteItem = (data) => {
    console.log('deleteItem : ', data);
    let dataObj = {};

    dataObj.deleteItemKey = data.key;
    console.log('deleteItem : ', data);

    $http({
      method: "POST",
      url: "/shop/deleteItem",
      data: dataObj,
      headers: { "Content-Type": "application/json; charset=utf-8" }

    }).then(function mySuccess(res) {
      let data = res.data;
      if (data.res) {
        getShopData();
      } else {
        let msg = "삭제 실패";
        if (data.data.reason) {
          msg += ": " + data.data.reason;
        }
        alert(msg);
      }
    }, function myError(res) {});
  }

  function getTagData() {
    $http({
      method: "POST",
      url: "/shop/getTagList",
      data: {},
      headers: { "Content-Type": "application/json; charset=utf-8" }
    }).then(
      function mySuccess(res) {
        let data = res.data;
        if (data.res) {
          $scope.tagList = data.data;
        }
      },
      function myError(res) {}
    );
  }

  function getShopData() {
    $http({
      method: "POST",
      url: "/shop/getShopData",
      data: {},
      headers: { "Content-Type": "application/json; charset=utf-8" }
    }).then(
      function mySuccess(res) {
        let data = res.data;
        if (data.res) {

          $scope.itemList = data.data;
        }
      },
      function myError(res) {}
    );
  }

});
