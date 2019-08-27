const express = require('express')
const cors = require('cors');
const parser = require('body-parser');
const path = require('path');

const CONFIG = require('./config')
const routes = require('./routes/index')
const port = process.env.PORT || CONFIG.PORT;

const app = express()

app.use(cors());

app.use(parser.json())

app.use(routes);

app.use(express.static(path.join(__dirname, '../client/build')));
app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../", "client", "build", "index.html"));
});


app.listen(port, () => console.log("Server stared on " + port))