app.factory('asanaService', function ($q, timeService, $rootScope) {
  var self = this;
  this.chart = {
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
        { "label":"midnight", "value":0 },
        { "label":"1am", "value":0 },
        { "label":"2am", "value":0 },
        { "label":"3am", "value":0 },
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
        { "label":"11pm", "value":0 }
      ]
    }]
  };

  // get token from cookie
  var token = document.cookie.split('token=')[1].split(';')[0]
  console.log('token:',token);

  function updateTasksAndDigest(taskDetails){
    console.log('adding',taskDetails,'to chart.data');
    var hour = Number(taskDetails.completed_at.split('T')[1].split(':')[0]);
    var count = self.chart.data[0].values[hour].value + 1;
    self.chart.data[0].values[hour].value = count;
    $rootScope.$digest();
  }

  if(token === 'test_token'){
    var allCompletedAt = ["2015-08-02T00:22:37.110Z", "2015-08-02T00:22:42.034Z", "2015-08-02T00:22:44.530Z", "2015-08-02T00:22:46.213Z", "2015-08-02T00:22:39.606Z", "2015-08-01T19:17:16.223Z", "2015-08-01T19:17:17.920Z", "2015-08-01T19:17:20.764Z", "2015-08-01T19:17:21.681Z", "2015-08-01T19:17:23.948Z", "2015-08-01T19:17:27.066Z"];
    var interval = setInterval(function(){
      if(allCompletedAt.length > 0){
        updateTasksAndDigest(allCompletedAt.pop());
      } else {
        clearInterval(interval);
      }
    }, 500);
  } else {
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
          limit: 5
        }).then(function (collection) {
          collection.stream().on('data', function (task) {
            var deferredTask = $q.defer();
            client.tasks.findById(task.id)
              .then(function (taskDetails) {
                deferredTask.resolve(taskDetails)
                workspaceTasks.push(taskDetails)
                updateTasksAndDigest(taskDetails);
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
        console.log("allCompletedAt: ", allCompletedAt);
      })
    })
  }

  return this;
})
