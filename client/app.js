var app = angular.module('Motivatr', []);

app.controller('vizCtrl', vizCtrl);

function vizCtrl(asanaService){
  this.something = 'Hello World';

  asanaService.tasks
};
