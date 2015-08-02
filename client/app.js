var app = angular.module('Motivatr', []);

app.controller('vizCtrl', vizCtrl);
vizCtrl.$inject = ['$scope', 'asanaService', 'timeService'];

function vizCtrl($scope, asanaService, timeService){
  this.chartData = asanaService.tasks;
  context = this.chartData
  this.data = asanaService;

  function randomHour () {
    return Math.floor(Math.random()*24);
  }

  function groupDatesByHour () {
    return (function(){ var x = []; while(x.length<24){x.push(Math.round(Math.random()*10));} return x; })()
  }
};

app.directive('nvChart', nvChart)
function nvChart(){
  return {
    restrict:'A'
    ,scope:{ data:'@' }
    ,template:'<div id="chart"><svg></svg></div><div class="data">{{data}}</div>'
    ,link:link
  }

  function link(scope){
    var chart = nv.models
                  .discreteBarChart()
                  .x(function(d) { return d.label })    //Specify the data accessors.
                  .y(function(d) { return d.value })
                  .staggerLabels(true)    //Too many bars and not enough room? Try staggering labels.
                  .tooltips(false)        //Don't show tooltips
                  .showValues(true)       //...instead, show the bar value right on top of each bar.
    nv.addGraph(loadChart);

    function loadChart() {
      d3.select('#chart svg')
          .datum(chartData())
        // .transition().duration(500)
          .call(chart);
      nv.utils.windowResize(chart.update);
      return chart;
    };

    setInterval(function(){
      console.log('update chart', nvChart);
      loadChart();
    }, 1000);

    function chartData(){
      return JSON.parse(scope.data);
    }

    //Each bar represents a single discrete quantity.
    function exampleData() {
      return [{"key":"Tasks Per Hour","values":[{"label":"midnight","value":5},{"label":"1am","value":0},{"label":"2am","value":0},{"label":"3am","value":0},{"label":"4am","value":0},{"label":"5am","value":0},{"label":"6am","value":0},{"label":"7am","value":0},{"label":"8am","value":0},{"label":"9am","value":0},{"label":"10am","value":0},{"label":"11am","value":0},{"label":"12pm","value":0},{"label":"1pm","value":0},{"label":"2pm","value":0},{"label":"3pm","value":0},{"label":"4pm","value":0},{"label":"5pm","value":0},{"label":"6pm","value":0},{"label":"7pm","value":6},{"label":"8pm","value":0},{"label":"9pm","value":0},{"label":"10pm","value":0},{"label":"11pm","value":0}]}]
    }
  }
}
