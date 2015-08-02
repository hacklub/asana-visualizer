var app = angular.module('Motivatr', ['nvd3']);

app.controller('vizCtrl', vizCtrl);
vizCtrl.$inject = ['$scope', 'asanaService', 'timeService'];
function vizCtrl($scope, asanaService, timeService){
  this.asana = asanaService;
  this.chart = asanaService.chart;
};
