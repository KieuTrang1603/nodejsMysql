const usersRouter = require("./usersRouter")

function route(app) {
    app.use("/admin/api/users", usersRouter)
}

module.exports = route;