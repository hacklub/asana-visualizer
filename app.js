var app = angular.module('Motivatr', []);

app.controller('vizCtrl', vizCtrl);

function vizCtrl(){
  console.log('hey');
  this.something = 'Hello World';
};
