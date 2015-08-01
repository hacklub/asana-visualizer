var app = angular.module('Motivatr', []);

app.controller('vizCtrl', ['$scope', function vizCtrl($scope){
  console.log('hey');
  $scope.something = 'Hello World';
}]);
