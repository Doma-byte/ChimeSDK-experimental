const express = require('express');
const bodyParser = require('body-parser');
const {PORT} = require('./src/config/serverconfig');
const ApiRoutes = require('./src/routes/index')
const cors = require('cors');

const setupAndStartServer = async () => {
    const app = express();
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.get('/',(req,res)=>{
        res.send("hello world");
    });

    app.use('/api',ApiRoutes);
    app.listen(PORT,async () => {
        console.log('Server started at ',PORT);
    })
}

setupAndStartServer();