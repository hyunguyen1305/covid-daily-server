const express = require("express");

const port = process.env.PORT || 1235;
const app = express();

const dataTableRoutes = require("./routes/data-table");
const dataNewsRoutes = require("./routes/data-news");


app.get('/', function (req, res) {
    res.send("<h1>API for Covid Daily</h1>");
});

app.use("/api", dataTableRoutes)
app.use("/api", dataNewsRoutes)




app.listen(port, function () {
    console.log(`App listening on port ${port}`);
});