const express = require("express")
// require("dotenv").config();
const PORT = 3000;
const app = express();


const bodyparser = require("body-parser");
require("./db");
require("./models/signup");
//
const authrouter = require("./routes/Authroutes");
const requiretoken=require("./Middlewares/Authtokenrequired")
//
app.use(bodyparser.json());
app.use(authrouter);

app.get("/",requiretoken, (req, res) => {
    res.send("Hello world")
});

app.listen(PORT, () => {
    console.log("connected Sucessfully")
});