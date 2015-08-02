app.factory('asanaService', function ($q, timeService, $rootScope) {
  var self = this;
  self.status = 'uninitialized';
  self.tasks = [];
  self.chart = {
    options: {
      chart: {
          type: 'discreteBarChart',
          height: 450,
          margin : {
              top: 20,
              right: 20,
              bottom: 60,
              left: 55
          },
          x: function(d){ return d.label; },
          y: function(d){ return d.value; },
          showValues: true,
          valueFormat: function(d){
              return d3.format(',.4f')(d);
          },
          transitionDuration: 500,
          xAxis: {
              axisLabel: 'X Axis'
          },
          yAxis: {
              axisLabel: 'Y Axis',
              axisLabelDistance: 30
          }
      }
    },
    data: [{
      key: "Tasks Per Hour",
      values: [
        { "label":"4am", "value":0 },
        { "label":"5am", "value":0 },
        { "label":"6am", "value":0 },
        { "label":"7am", "value":0 },
        { "label":"8am", "value":0 },
        { "label":"9am", "value":0 },
        { "label":"10am", "value":0 },
        { "label":"11am", "value":0 },
        { "label":"12pm", "value":0 },
        { "label":"1pm", "value":0 },
        { "label":"2pm", "value":0 },
        { "label":"3pm", "value":0 },
        { "label":"4pm", "value":0 },
        { "label":"5pm", "value":0 },
        { "label":"6pm", "value":0 },
        { "label":"7pm", "value":0 },
        { "label":"8pm", "value":0 },
        { "label":"9pm", "value":0 },
        { "label":"10pm", "value":0 },
        { "label":"11pm", "value":0 },
        { "label":"midnight", "value":0 },
        { "label":"1am", "value":0 },
        { "label":"2am", "value":0 },
        { "label":"3am", "value":0 }
      ]
    }]
  };

  function convertTaskToChartData(taskDetails){
    if(taskDetails && taskDetails.completed_at){
      var localTime = new Date(taskDetails.completed_at);
      console.log('adding',taskDetails,'to chart.data');
      var hour = localTime.getHours();
      var chartIndex = (hour+20)%24 // 4am is the first label
      var count = self.chart.data[0].values[chartIndex].value + 1;
      self.chart.data[0].values[chartIndex].value = count;
      $rootScope.$apply();
    }
  }

  // get token from cookie
  var token = document.cookie.split('token=')[1].split(';')[0]
  console.log('token:',token);

  function updateTasksAndDigest(taskDetails){
  }

  if(token === 'test_token'){
    self.status = 'faking';
    // generate random fake data
    var allCompletedAt = []
    while(allCompletedAt.length < 20){
      allCompletedAt.push({ completed_at:'2015-08-02T'+('0'+Math.floor(Math.random()*24)).slice(-2)+':22:37.110Z' });
    }
    // fake stream data into controller
    var interval = setInterval(function(){
      if(allCompletedAt.length > 0){
        convertTaskToChartData(allCompletedAt.pop());
      } else {
        self.status = 'done';
        $rootScope.$apply();
        clearInterval(interval);
      }
    }, 500);
  } else {
    self.status = 'loading';
    var client = Asana.Client.create()
    client.useOauth({ credentials: token })

    // TODO take all workspaces, filter by completed by user, map timestamp
    client.users.me().then(function (user) {
      var taskParams = {}
      taskParams.workspaces = user.workspaces
      console.log('user.workspaces',user.workspaces);
      taskParams.userId = user.id
      console.log("user:", user);
      return taskParams
    }).then(function (params) {
      var promises = _.map(params.workspaces, function (workspace) {
        var workspaceTasks = []
        var deferredCollection = $q.defer()
        client.tasks.findAll({
          assignee: params.userId,
          workspace: workspace.id,
          limit: 3
        }).then(function (collection) {
          collection.stream().on('data', function (task) {
            client.tasks.findById(task.id).then(function (taskDetails) {
                self.tasks.push(taskDetails);
                convertTaskToChartData(taskObject);
            })
          }).on('end', function () {
            deferredCollection.resolve(workspaceTasks)
          })
        })
        return deferredCollection.promise;
      })

      $q.all(promises).then(function (allTasksByWorkspace) {
        var allTasks = _.flatten(allTasksByWorkspace);
        var allCompletedAt = allTasks.map(function(task){
          return task.completed_at;
        }).filter(function (completed_at) {
          return !!completed_at;
        });
        self.status = 'done';
        console.log("allCompletedAt: ", allCompletedAt);
      })
    })
  }

  return this;
})
