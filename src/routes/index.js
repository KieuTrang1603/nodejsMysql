const filesRouter = require("./filesRouter")
const usersRouter = require("./usersRouter")
const notificationsRouter = require("./notificationsRouter")

function route(app) {
    app.use("/admin/api/users", usersRouter)
    app.use("/file", filesRouter)
    app.use("/api/notification", notificationsRouter)
}

module.exports = route;