app.factory('asanaService', function ($http) {

  // get token from cookie
  var token = document.cookie.split('token=')[1].split(';')[0]
  var TASKLIST = []

  var client = Asana.Client.create()
  client.useOauth({ credentials: token })

  (function getTasks () {
  
      client.users.me().then(function (user) {
        var taskParams = {}
        taskParams.workspaceId = _.first(user.workspaces).id
        taskParams.userId = user.id
        return taskParams
      }).then(function (params) {
  
        client.tasks.findAll({
          assignee: params.userId,
          workspace: params.workspaceId,
          limit: 1
        }).then(function (collection) {

          collection.stream().on('data', function (task) {

            client.tasks.findById(task.id)
              .then(function (taskDetails) {
                TASKLIST.push(taskDetails)
              })      

          }).on('end', function () {
            console.log('Captured all tasks')
          })
        })
      })

  })()

  return {
    tasks: TASKLIST
  }
})