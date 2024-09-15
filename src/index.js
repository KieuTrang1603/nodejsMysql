const express = require("express");
const morgan = require('morgan');
const cors = require("cors");
const route = require("./routes");
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');
const app = express();

app.use(cors({credentials: true, origin: "*"}));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next();
});
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());
app.use(morgan('combined'))
app.use(express.json());


//cấu hình router
route(app);
app.listen(process.env.PORT, () => console.log(`Up & Running ${process.env.PORT}`));