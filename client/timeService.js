app.factory('timeService', function () {

  var parseTimes = function (arrayOfTimes) {
    var rawTime = _.map(arrayOfTimes, function (time) {
      return moment(time).format('hA');
    });
    
    var x= _.reduce(['4AM','5AM','6AM','7AM','8AM','9AM','10AM','11AM','12PM','1PM','2PM','3PM','4PM','5PM','6PM','7PM','8PM','9PM','10PM','11PM','12AM','1AM','2AM','3AM'], function (agg, time) {
      var y =_.reduce(rawTime, function countMatches(count, completedAtHour){
        return count += completedAtHour === time ? 1 : 0;
      }, 0);
      agg.push(y)
      return agg
    }, []);
    return x
  };

  return {
    parseTimes: parseTimes
  }
})