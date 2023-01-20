const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(express.urlencoded({extended: true}));

app.listen(7000, (req, res) => {
    console.log("listening on 7000");
});

app.get('/', (req, res)=>{
    res.sendFile(__dirname +'/index.html');
});

app.get('/write', (req, res) => { 
    res.sendFile(__dirname +'/write.html');
});

app.post('/add', (req, res) => {
    res.send('전송완료');
    console.log(req.body.title);
})