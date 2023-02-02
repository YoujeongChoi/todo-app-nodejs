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

// 글 업로드
router.post('/', 로그인했니 ,(req, res) => {
    var dateVar = new Date();
    res.send('전송완료');
    console.log(req.body.title);
    db.collection('counter').findOne({name:'questionCount'}, (error, result) => {
        console.log(result.totalPost);
        var 총게시물갯수 = result.totalPost;
    });
    db.collection('counter').insertOne({title : req.body.title, createdAt : dateVar, user : req.user._id, updatedAt : dataVar}, (err, result) => {
        console.log('저장완료');
        // .updateone(요런데이터를 ,이렇게수정)
        db.collection('counter').updateOne({name:'questionCount'}, {$inc : {totalPost : 1}}, function(err, result){
            if (err) {return console.log(err)};
        })
    });
})


// 리스트 출력
router.get('/', (req, res) => {
    db.collection('questionPost').find().toArray((err, result) => {
        console.log(result);
        // res.render('list.ejs', {posts : result});  // {이런이름으로 : 이런데이터를}
        // res.json(result);
        res.json("hello world");

    });
    
})

// 글 수정
router.get('/edit/:id', 로그인했니 ,(req, res) => {
    db.collection('questionPost').findOne({_id : parseInt(req.params.id)}, function(error, result) {
        console.log(result);
        res.json(result);
    })
    // res.render('edit.ejs', {post : 결과})
    
})

router.patch('/edit', 로그인했니 ,(req, res) => {
    // updateOne (어떤게시물 수정할건지, 수정값, 콜백함수)
    // $set : 오퍼레이터다. 없데이트 해주세요 (없으면 추가해주세요)
    db.collection('questionPost').updateOne({_id : parseInt(req.body.id)}, { $set : {title : req.body.title, user : req.user._id, updatedAt : dataVar}}, (error, result) => {
        res.json(result);
    })
})

// 글 삭제
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