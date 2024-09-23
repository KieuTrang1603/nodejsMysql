const filesRouter = require("./filesRouter")
const usersRouter = require("./usersRouter")
const notificationsRouter = require("./notificationsRouter")
const commentsRouter = require("./commentsRouter")
const videosRouter = require("./videosRouter")

function route(app) {
    app.use("/api/users", usersRouter)
    app.use("/api/file", filesRouter)
    app.use("/api/notification", notificationsRouter)
    app.use("/api/comments", commentsRouter)
    app.use("/api/videos", videosRouter)
}

module.exports = route;