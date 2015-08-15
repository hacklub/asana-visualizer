var app = angular.module('Motivatr', ['nvd3']);

app.controller('vizCtrl', vizCtrl);
vizCtrl.$inject = ['$scope', 'asanaService', 'timeService'];
function vizCtrl($scope, asanaService, timeService){
  var self = this;
  this.asana = asanaService;
  this.chart = asanaService.chart;
  this.blink = 'blink';
  $scope.$watch(function () {
    return asanaService.status;
  }, function (status) {
    if (status === 'done') {
      self.blink = 'blinkOff';
    } 
  });

  this.findMostProductiveHour = function(chartData){
    var mostProductiveHour = chartData[0].values.reduce(function(max, datapoint){
      max = max.value > datapoint.value ? max : datapoint;
      return max;
    }, { label:'', value:0 })
    return mostProductiveHour;
  }
};

app.controller('captureEmailController', captureEmailController)
captureEmailController.$inject = ['$http'];
function captureEmailController($http){
  var self = this;
  self.submitButtonText = 'Submit';
  self.submit = function(email){
    console.log('submitted',email);
    self.submitButtonText = 'Submitting...';
    $http.post('http://localhost:8080/email', {email:email}).then(onSuccess, onError);
    function onSuccess(response){
      console.log('success args',arguments);
      self.submitButtonText = 'Submitted!';
    };
    function onError(response){
      console.log('error args',arguments);
      self.submitButtonText = 'Error';
    };
  }
}
