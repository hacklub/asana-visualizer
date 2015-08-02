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
    ,template:'<div class="ct-chart"></div><div>{{data}}</div>'
    ,link:createChartist
  }

  function createChartist(scope){
    var datapoints = JSON.parse(scope.data);
    // Create a simple bi-polar bar chart
    var chartistData = {
      labels: ['4am','5am','6am','7am','8am','9am','10am','11am','12 noon','1pm','2pm','3pm','4pm','5pm','6pm','7pm','8pm','9pm','10pm','11pm','12 midnight','1am','2am','3am']
      ,series: [ datapoints ]
    };

    var chartistOptions = {
      width: (2/3)*Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
      ,height: (2/3)*Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
      ,high: Math.max.apply(null, datapoints)+1
      ,low: 0
      ,axisX: { labelInterpolationFnc: function(value, index) { return (index-2) % 3 === 0 ? value : null; } }
      ,axisY: { labelInterpolationFnc: function(value, index) { return index % 2 === 0 ? value : null; } }
    };

    var chart = new Chartist.Bar('.ct-chart', chartistData, chartistOptions);
    // Listen for draw events on the bar chart
    chart.on('draw', function(data) {
      // If this draw event is of type bar we can use the data to create additional content
      if(data.type === 'bar') {
        // We use the group element of the current series to append a simple circle with the bar peek coordinates and a circle radius that is depending on the value
        data.group.append(new Chartist.Svg('circle', {
          cx: data.x2,
          cy: data.y2,
          r: Math.abs(Chartist.getMultiValue(data.value)) * 2 + 5
        }, 'ct-slice-pie'));
      }
    });
  }
}
