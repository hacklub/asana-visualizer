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

app.directive('dayChart', dayChart)
function dayChart(){
  return {
    restrict:'A'
    ,scope:{ data:'@' }
    ,template:'<div id="chart"><svg></svg></div><div class="data">{{data}}</div>'
    ,link:createChart
  }
  function createChart(){
    console.log('discreteBarChart', typeof nv.models.discreteBarChart);
    console.log('staggerLabels', typeof nv.models.discreteBarChart().staggerLabels);
    console.log('tooltips', typeof nv.models.discreteBarChart().tooltips);
    console.log('showValues', typeof nv.models.discreteBarChart().showValues);
    console.log('transitionDuration', typeof nv.models.discreteBarChart().transitionDuration);

    nv.addGraph(function() {
      var chart = nv.models.discreteBarChart()
          .x(function(d) { return d.label })    //Specify the data accessors.
          .y(function(d) { return d.value })
          .staggerLabels(true)    //Too many bars and not enough room? Try staggering labels.
          .tooltips(false)        //Don't show tooltips
          .showValues(true)       //...instead, show the bar value right on top of each bar.
          // .transitionDuration(350);

      d3.select('#chart svg')
          .datum(exampleData())
          .call(chart);

      nv.utils.windowResize(chart.update);

      return chart;
    });

    //Each bar represents a single discrete quantity.
    function exampleData() {
     return  [
        {
          key: "Cumulative Return",
          values: [
            {
              "label" : "A Label" ,
              "value" : -29.765957771107
            } ,
            {
              "label" : "B Label" ,
              "value" : 0
            } ,
            {
              "label" : "C Label" ,
              "value" : 32.807804682612
            } ,
            {
              "label" : "D Label" ,
              "value" : 196.45946739256
            } ,
            {
              "label" : "E Label" ,
              "value" : 0.19434030906893
            } ,
            {
              "label" : "F Label" ,
              "value" : -98.079782601442
            } ,
            {
              "label" : "G Label" ,
              "value" : -13.925743130903
            } ,
            {
              "label" : "H Label" ,
              "value" : -5.1387322875705
            }
          ]
        }
      ]
    }
  }
}
