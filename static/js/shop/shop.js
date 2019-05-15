window.onload = function() {};

common.controller("shopController", function($scope, $http, $compile) {
  $scope.selectOption = [
    { code: "itemName", name: "상품이름" },
    { code: "itemTag", name: "상품태그" }
  ];
  $scope.optSelected = $scope.selectOption[0];

  getShopData();

  $scope.shopSearch = () => {
    let data = {};
    data.filterText = $scope.shopSearchText;
    data.filterOption = $scope.optSelected.code;

    getShopData(true, data);
  };

  $scope.addShoppingBasket = (data, event) => {
    let dataObj = {};
    let temp = {};

    let $itemBox = findParentByClass(event.target, "item-box");
    let $itemCount = $itemBox.querySelector("#itemCnt");
    let itemName = data.itemName;
    temp.key = data.key;
    temp.cnt = $itemCount.value;
    dataObj.shopBasket = temp;

    $http({
      method: "POST",
      url: "/shop/addShoppingBasket",
      data: dataObj,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    }).then(
      function mySuccess(res) {
        let data = res.data;
        if (data.res) {
          let text = "";

          text += '<div class="flex shop-basket-alert">';
          text +=
            "<span>" +
            itemName +
            "이 " +
            $itemCount.value +
            "개 추가되었습니다.</span>";
          text += "</div>";
          let $text = angular.element(text);
          angular
            .element(document.getElementsByClassName("shop-basket-info"))
            .append($text);

          setTimeout(() => {
            $text[0].style.opacity = 0;
            setTimeout(() => {
              $text[0].parentNode.removeChild($text[0]);
            }, 2000);
          }, 2000);
        } else {
          let msg = "장바구니 추가 실패 : ";
          if (data.data.reason) {
            msg += data.data.reason;
          }
          alert(msg);
        }
      },
      function myError(res) {}
    );
  };

  function getShopData(isSearch = false, searchData = {}) {
    $http({
      method: "POST",
      url: "/shop/getShopData",
      data: {},
      headers: { "Content-Type": "application/json; charset=utf-8" }
    }).then(
      function mySuccess(res) {
        let data = res.data;
        test = data.data;
        if (data.res) {
          if (isSearch) {
            let filterText = searchData.filterText;
            let filterOption = searchData.filterOption;
            data.data = data.data.filter(data => {
              if (filterOption == "itemName") {
                return data[filterOption].includes(filterText);
              } else {
                for (let i = 0; i < data.itemTag.length; i++) {
                  if (data.itemTag[i].name.includes(filterText)) {
                    return true;
                  }
                }
                return false;
              }
            });
          }

          setData(data.data);
        }
      },
      function myError(res) {}
    );
  }

  function setData(data) {
    let tempObj = {};
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < (data[i].itemTag || []).length; j++) {
        let name = data[i].itemTag[j].name || "";
        let isIn = tempObj.hasOwnProperty(name);
        if (isIn) {
          tempObj[name].push(data[i]);
        } else {
          data[i].tagName = name;
          tempObj[name] = [];
          tempObj[name].push(data[i]);
        }
      }
    }
    $scope.shopList = tempObj;
  }
});
