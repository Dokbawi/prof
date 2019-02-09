window.onload = function () {

}



common.controller('shoppingBasketController', function ($scope, $http, $compile) {
  $scope.allAccountMoney = 0;
  getShoppBasketData();


  $scope.pay = function () {
    $http({
      method: "POST",
      url: "/shop/payShoppingBasket",
      data: {},
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    }).then(function mySuccess(res) {
      let data = res.data;

      console.log('datad : ', data);
      if (data.res) {
        alert("결제 성공 : " + data.data);
        location.href = "/shop";
      } else {
        let = msg = "결제 실패 : ";
        if (data.data.reason) {
          msg += data.data.reason;
        }
        alert(msg);
      }
    }, function myError(res) {});
  }

  function getShoppBasketData() {
    $http({
      method: "POST",
      url: "/shop/getShoppingBasket",
      data: {},
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    }).then(function mySuccess(res) {
      let data = res.data;

      console.log('datad : ', data);
      if (data.res) {

        setShoppBasketData(data.data);
      } else {
        let = msg = "장바구니 불러오기 실패 : ";
        if (data.data.reason) {
          msg += data.data.reason;
        }
        alert(msg);
      }
    }, function myError(res) {});
  }

  function setShoppBasketData(data) {
    console.log('d : ', data);
    let temp = [];
    let price = 0;
    for (let i = 0; i < (data || []).length; i++) {
      temp[i] = data[i];
      temp[i].itemCnt = temp[i].cnt;
      temp[i].itemPrice = temp[i].itemPrice * temp[i].cnt;

      price += temp[i].itemPrice;
    }
    $scope.shoppingBasketList = temp;
    $scope.allAccountMoney = price;
  }


});
