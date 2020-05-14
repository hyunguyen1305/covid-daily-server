const express = require("express");
const port = process.env.PORT || 1235;
const app = express();


app.get('/', function (req, res) {
    res.send("<h2>Hello World</h2>");
});
app.listen(port, function () {
    console.log(`App listening on port ${port}`);
});