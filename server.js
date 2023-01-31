const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { MongoDBNamespace } = require('mongodb');
const { reset } = require('nodemon');
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');

var db;
const MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb+srv://solux:v2S0XNmgGZyjNPGS@cluster0.hphxqw9.mongodb.net/?retryWrites=true&w=majority', function(err, client) {
    if(err) return console.log(err);
    db = client.db('todoapp');
    app.listen(7000, (req, res) => {
        console.log("listening on 7000");
    });    
})

// .html 파일들
app.get('/', (req, res)=>{
    res.sendFile(__dirname +'/index.html');
});

app.get('/write', (req, res) => { 
    // res.sendFile(__dirname +'/write.html');
    res.render('write.ejs');
});

// 추가
app.post('/add', (req, res) => {
    res.send('전송완료');
    console.log(req.body.title);
    db.collection('counter').findOne({name:'게시물갯수'}, (error, result) => {
        console.log(result.totalPost);
        var 총게시물갯수 = result.totalPost;
    });
    db.collection('post').insertOne({제목 : req.body.title, 날짜 : req.body.date}, (err, result) => {
        console.log('저장완료');
        // .updateone(요런데이터를 ,이렇게수정)
        db.collection('counter').updateOne({name:'게시물갯수'}, {$inc : {totalPost : 1}}, function(err, result){
            if (err) {return console.log(err)};
        })
    });
})

// 리스트 출력
app.get('/list', (req, res) => {
    db.collection('post').find().toArray((err, result) => {
        console.log(result);
        res.render('list.ejs', {posts : result});  // {이런이름으로 : 이런데이터를}
        // res.json(result);

    });
    
})

// 삭제
app.delete('/delete', (req, res) => {
    console.log(req.body);
    req.body._id = parseInt(req.body._id); // object 자료 다루기 기술

    // deleteOne 괄호 안 첫번째 값으로 삭제할 항목을 넣어준다. - req.body는 ajax요청으로 넘어온 값
    db.collection('post').deleteOne(req.body, (result,error) => {
        console.log('삭제완료');
        res.status(200).send({message : '성공했습니다'});
    })
})

// 상세페이지 확인
app.get('/detail/:id', (req, res) => {
    // params.id -> 요청 url의 파라미터중 :id 인 게시물을 찾음
    db.collection('post').findOne({_id : parseInt(req.params.id)}, (error, result) => {
        console.log(result);
        res.render('detail.ejs', { data : 결과});
    }) // <<추가>> 없는 게시물 처리 - 에러코드로
    
})

// 수정
app.get('/edit', (req, res) => {
    req.render('edit.e')
})