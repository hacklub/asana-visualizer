var app = angular.module('Motivatr', ['nvd3']);

app.controller('vizCtrl', vizCtrl);
vizCtrl.$inject = ['$scope', 'asanaService', 'timeService'];
function vizCtrl($scope, asanaService, timeService){
  this.asana = asanaService;
  this.chart = asanaService.chart;
  this.findMostProductiveHour = function(chartData){
    var mostProductiveHour = chartData[0].values.reduce(function(max, datapoint){
      max = max.value > datapoint.value ? max : datapoint;
      return max;
    }, { label:'', value:0 })
    return mostProductiveHour;
  }
};
