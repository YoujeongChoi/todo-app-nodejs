const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);

const bodyParser = require('body-parser');
const { MongoDBNamespace } = require('mongodb');
const { reset } = require('nodemon');
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json())
app.set('view engine', 'ejs');
require('dotenv').config();

const cors = require('cors');
app.use(cors());


var db;
const MongoClient = require('mongodb').MongoClient;
MongoClient.connect(process.env.DB_URL, function(err, client) {
    if(err) return console.log(err);
    db = client.db('todoapp');
    server.listen(process.env.PORT, (req, res) => {
        console.log("listening on 7000");
    });    
})

// method-override
const methodOverride = require('method-override')
app.use(methodOverride('_method'))

// session 로그인 라이브러리
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

// 미들웨어 : 요청-응답 중간에 실행되는 코드
app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session()); 

// 이미지 저장 라이브러리 - multer
let multer = require('multer');
var storage = multer.diskStorage({
    destination : function(req, file, cb) {
        cb(null, './public/image')
    },
    filename : function(req, file, cb) {
        cb(null, file.originalname)
    },
    // filename : function(req, file, cb) {

    // },
    // limits : 
});
var upload = multer({storage : storage});

app.use('/questions', require('./routes/questions.js'));
app.use('/reviews', require('./routes/reviews.js'));
app.use('/quals', require('./routes/quals.js'))


// .html 파일들
app.get('/', (req, res)=>{
    res.sendFile(__dirname +'/index.html');
});


// 로그인
app.get('/login', (req, res) => {
    res.render('login.ejs');
})

app.post('/login', passport.authenticate('local', {
    failureRedirect : '/fail'
}), (req, res) => {
    res.redirect('/')
})

passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
  }, function (입력한아이디, 입력한비번, done) {
    //console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
      if (에러) return done(에러)
  
      if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
      if (입력한비번 == 결과.pw) {
        return done(null, 결과)
      } else {
        return done(null, false, { message: '비번틀렸어요' })
      }
    })
  }));

    // id이용해서 세션 저장시키는 코드 (로그인 성공시 발동)
passport.serializeUser(function(user, done) {
    done(null, user.id);
})
    // 해당 세션 데이터를 가진 사람을 db에서 찾는다 (마이페이지 접속 시 발동)
passport.deserializeUser(function(아이디, done){                    // 아이디는 위에있는 user.id와 동일
    db.collection('login').findOne({id : 아이디}, function(에러, 결과) {
        done(null, 결과);    // 마이페이지 접속 시 db에서 {id : 어쩌구} 인 것을 찾아서 그 결과를 보내줌
    })
})

// 회원가입
app.post('/register', (req, res) => {
    db.collection('login').insertOne({id : req.body.id, pw : req.body.pw}, (error, result) => {
        res.redirect('/')
        // res.json(result.body);
    })
})


app.get('/write', (req, res) => { 
    // res.sendFile(__dirname +'/write.html');
    res.render('write.ejs');
});


// 글 업로드
app.post('/add', (req, res) => {
    res.send('전송완료');
    console.log(req.body.title);
    db.collection('counter').findOne({name:'게시물갯수'}, (error, result) => {
        console.log(result.totalPost);
        var 총게시물갯수 = result.totalPost;
    });
    db.collection('post').insertOne({제목 : req.body.title, 날짜 : req.body.date, 작성자 : req.user._id}, (err, result) => {
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


// 검색
app.get('/search', (req, res) => {
    // db.collection('post').find({$text : {$search : req.query.value}}).toArray((error, result) => {
    //     console.log(result);
    //     res.render('search.ejs', {posts : result});
    // })

    var 검색조건 = [
        {
          $search: {
            index: '님이만든인덱스명',
            text: {
              query: req.query.value,
              path: '제목'  // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
            }
          }
        },
        // {$sort : {_id : 1}},     // id순 정렬
        // {$limit : 10},            // 상위 10개만
        {$project : {제목:1, _id:0, score : {$meta : "searchScore"}}} 
    ] 
      console.log(req.query);
      db.collection('post').aggregate(검색조건).toArray((error, result)=>{
        if (error) console.log(result)
        응답.render('search.ejs', {posts : result})
      })
})


// 삭제
app.delete('/delete', (req, res) => {
    console.log(req.body);
    req.body._id = parseInt(req.body._id); // object 자료 다루기 기술

    var 삭제할데이터 = {_id : req.body._id, 작성자 : req.user._id}

    // deleteOne 괄호 안 첫번째 값으로 삭제할 항목을 넣어준다. - req.body는 ajax요청으로 넘어온 값
    db.collection('post').deleteOne(삭제할데이터, (error , result) => {
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
app.get('/edit/:id', (req, res) => {
    db.collection('post').findOne({_id : parseInt(req.params.id)}, function(error, result) {

    })
    res.render('edit.ejs', {post : 결과})
})

// app.put('/edit', (req, res) => {
//     // updateOne (어떤게시물 수정할건지, 수정값, 콜백함수)
//     // $set : 오퍼레이터다. 없데이트 해주세요 (없으면 추가해주세요)
//     db.collection('post').updateOne({_id : parseInt(req.body.id)}, { $set : {제목 : ??, 날짜 : ??}}, (error, result) => {

//     })
// })



// 마이페이지
app.get('/mypage', 로그인했니, (req, res) => {
    console.log(req.user);             // deserializeUser에서 찾았던 db정보게 req.user에 담겨져있다
    res.render('mypage.ejs', {사용자 : req.user});
})

    // 미들웨어 (마이페이지 접속전 실행할 미들웨어)
function 로그인했니 (req, res, next) {
    if(req.user) {                      // 로그인후 세션이 있으면 req.user가 항상 있는다
        next()
    } else {
        res.send('로그인안하셨는데요')
    }
}


// 사진업로드
// app.get('/upload', (req, res) => {
//     res.render('upload.ejs');
// })

// app.post('/upload', upload.sinlge('프로필'), function(요청, 응답) {     // upload.single(input의 name 속성이름)
//     res.send('업로드완료');                                               // upload.array('프로필', 10)
// })

// app.get('/image/:imageName', (req, res) => {
//     res.sendFile(__dirname + '/public/image/' + res.params.imageName)
// })