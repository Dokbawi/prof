window.onload = function () {

}

function imageChange(ele) {
  let $image = document.getElementById('itemImg');
  $image.src = URL.createObjectURL(ele.files[0]);;
}

common.controller('shopAddController', function ($scope, $http, $compile) {

  let selectAddObj = {};
  let selectDeleteDataIdx = 0;
  $scope.addTagList = [];

  getShopData();

  function getShopData() {
    $http({
      method: "POST",
      url: "/shop/getTagList",
      data: {},
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    }).then(function mySuccess(res) {
      let data = res.data;
      if (data.res) {
        $scope.tagList = data.data;
      }
    }, function myError(res) {});
  }

  $scope.addShopItem = () => {
    let formData = new FormData(document.getElementById('myForm'));
    // formData.append('tagList', JSON.stringify($scope.addTagList));
    
    $http({
      method: "POST",
      url: "/shop/saveShopItem",
      data: formData,
      headers: {
        'Content-Type': undefined
      }
    }).then(function mySuccess(res) {
      let data = res.data;
      if (data.res) {
        alert('저장 완료');
        // location.href = '/shop';
      } else {
        let msg = "저장실패";
        if (data.data.reason) {
          msg += ": " + data.data.reason;
        }
        alert(msg);
      }
    }, function myError(res) {});
  }

  $scope.deleteTag = () => {
    $scope.addTagList.splice(selectDeleteDataIdx, 1);
  }

  $scope.addTag = () => {
    let $tag = document.getElementsByClassName('tag-ul-active');
    let temp = [];
    temp[0] = selectAddObj;

    let list = merge($scope.addTagList, temp, '$$hashKey');
    $scope.addTagList = list;
  }

  $scope.tagListClick = (event) => {
    let $tag = findParentByTag(event.target, 'ul');

    for (i = 0; i < $tag.children.length; i++) {
      $tag.children[i].classList.remove('tag-ul-active');
    }

    let index = Array.prototype.indexOf.call(event.target.parentElement.children, event.target);

    selectAddObj = $scope.tagList[index];

    event.target.classList.add("tag-ul-active");

  }

  $scope.addTagListClick = (event) => {
    let $tag = findParentByTag(event.target, 'ul');

    for (i = 0; i < $tag.children.length; i++) {
      $tag.children[i].classList.remove('add-tag-ul-active');
    }

    let index = Array.prototype.indexOf.call(event.target.parentElement.children, event.target);

    selectDeleteDataIdx = index;

    event.target.classList.add("add-tag-ul-active");

  }

});
