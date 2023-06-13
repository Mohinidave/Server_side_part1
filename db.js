const mongoose=require("mongoose");
require("dotenv").config();
mongoose.connect(process.env.mongo_URL).then(
    () =>{
        console.log("Successfully connected to database")
    }
).catch((err)=>{
    console.log(`could not connect to database ${err}`)
});

