var router = require('express').Router();
var db;
const MongoClient = require('mongodb').MongoClient;
MongoClient.connect(process.env.DB_URL, function(err, client) {
    if(err) return console.log(err);
    db = client.db('todoapp');  
})

// 미들웨어 (마이페이지 접속전 실행할 미들웨어)
function 로그인했니 (req, res, next) {
    if(req.user) {                      // 로그인후 세션이 있으면 req.user가 항상 있는다
        next()
    } else {
        res.send('로그인안하셨는데요')
    }
}

app.use('/comments', require('./routes/comments.js'));

// 북마크 추가
router.post('/', 로그인했니 ,(req, res) => {
    var dateVar = new Date();
    res.send('전송완료');
    db.collection('counter').findOne({name:'bookmarkCount'}, (error, result) => {
        console.log(result.totalPost);
        var 총게시물갯수 = result.totalPost;
    });
    db.collection('bookmark').insertOne({title : req.body.title, createdAt : dateVar, user : req.user._id, updatedAt : dataVar}, (err, result) => {
        console.log('저장완료');
        // .updateone(요런데이터를 ,이렇게수정)
        db.collection('counter').updateOne({name:'bookmarkCount'}, {$inc : {totalPost : 1}}, function(err, result){
            if (err) {return console.log(err)};
        })
    });
})


// 리스트 출력
router.get('/', (req, res) => {
    db.collection('bookmark').find().toArray((err, result) => {
        console.log(result);
        // res.render('list.ejs', {posts : result});  // {이런이름으로 : 이런데이터를}
        res.json(result);
    });
})


// 북마크 삭제
router.put('/:id', 로그인했니, (req, res) => {
    var dateVar = new Date();

    // params.id -> 요청 url의 파라미터중 :id 인 게시물을 찾음
    db.collection('questionPost').findOne({_id : parseInt(req.params.id)}, { $set : {title : req.body.title, user : req.user._id, updatedAt : dataVar, deletedAt : dataVar ,status : "deleted"}}, (error, result) => {
        console.log(result);
        // res.render('detail.ejs', { data : 결과});
        res.json(result);  
    }) // <<추가>> 없는 게시물 처리 - 에러코드로
    
})


// 특정 게시물 조회
router.get('/detail/:id', (req, res) => {
    // params.id -> 요청 url의 파라미터중 :id 인 게시물을 찾음
    db.collection('questionPost').findOne({_id : parseInt(req.params.id)}, (error, result) => {
        console.log(result);
        // res.render('detail.ejs', { data : 결과});
        res.json(result);  
    }) // <<추가>> 없는 게시물 처리 - 에러코드로
    
})

module.exports = router;