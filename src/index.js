const express = require("express");
const morgan = require('morgan');
const cors = require("cors");
const route = require("./routes");
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');
const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());
app.use(morgan('combined'))

//cấu hình router
route(app);
app.listen(process.env.PORT, () => console.log(`Up & Running ${process.env.PORT}`));