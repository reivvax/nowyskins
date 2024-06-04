const express = require('express');
const { readFile } = require('fs');
const usersRoutes = require('./src/users/routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
    readFile("./front/mainpage/index.html", "utf-8", (err, html) => {
        if (err) {
            res.status(500).send("Error ocurred");
        }
        res.status(200).send(html);
    })
    console.log("jeste tu");
});

app.use('/api/v1/users', usersRoutes);

app.listen(PORT, () => {console.log(`App available on http://localhost:${PORT}`)})