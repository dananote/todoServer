// express로 서버를 띄우기 위한 기본 문법
const express = require('express');
const app = express();
require('dotenv').config();

// pubic 폴더를 자유롭게 html, css, js (static) 파일을 제공하기 위한 설정
// __dirname은 현재 실행중인 파일의 경로를 의미
app.use(express.static(__dirname + '/public'))
console.log(process.env.MONGO_DB_URL)
// ejs 템플릿 엔진 사용
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// mongoDB 연결
const { MongoClient, ObjectId } = require('mongodb');

let db;
// url의 아이디:비밀번호로 사이에 잘 입력
const url = process.env.MONGO_DB_URL;

// MongoDB에 접속해 달라는 함수
new MongoClient(url).connect().then((client) => {
  console.log('MongoDB connected');
  // MonogoDB 접속 성공시 'todo'라는 DB에 연결
  db = client.db('todo'); // todo라는 DB에 연결
}).catch((err) => {
  console.error('MongoDB connection error:', err);
}
);

// 8080 포트로 서버 오픈
app.listen(8080, function () {
  console.log('Server is running on port 8080');
})

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
})

/**
 * 목록
 */
// 목록 페이지 제공
app.get('/list', async (req, res) => {
  const result = await db.collection('post').find().toArray()

  res.render('list.ejs', { posts: result });
})

/**
 * 상세
 */
// 상세 페이지 제공
app.get('/detail/:id', async (req, res) => {
  const id = new ObjectId(req.params.id)
  try {
    const result = await db.collection('post').findOne({ _id: id })

    if (!result) {
      // 맞는 id가 없을 경우
      return res.status(404).send('Not Found');
    }
    res.render('detail.ejs', { post: result });

  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(404).send('Not Found');
  };
})

/**
 * 추가
 */
// 게시물 추가 페이지 제공
app.get('/add', (req, res) => {
  res.render('add.ejs')
})

// 게시물 생성
app.post('/add', async (req, res) => {
  const { title, content } = req.body;

  try {
    if (title && content) {
      await db.collection('post').insertOne({ title, content });
      res.redirect('/list');
    } else {
      // 클라이언트 에러
      res.status(400).send('Bad Request');
    }
  } catch (error) {
    console.error('Error inserting document:', error);
    // 서버 에러
    res.status(500).send('Internal Server Error');
  }
})

/**
 * 수정
 */
// 게시물 수정 페이지 제공
app.get('/update/:id', async (req, res) => {
  const id = new ObjectId(req.params.id)

  try {
    const result = await db.collection('post').findOne({ _id: id })
    if (!result) {
      // 맞는 id가 없을 경우
      return res.status(404).send('Not Found');
    }
    res.render('update.ejs', { post: result });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(404).send('Not Found');
  }
})

app.post('/update/:id', async (req, res) => {
  console.log(req.params)
  const { title, content } = req.body;
  const id = new ObjectId(req.params.id)

  console.log(id, title, content)
  if (title && content) {

    try {
      await db.collection('post').updateOne({ _id: id }, {
        $set: { title, content }
      })
      res.redirect('/list');
    } catch (error) {
      console.error('Error updating document:', error);
      // 서버 에러
      res.status(500).send('Internal Server Error');
    }
  } else {
    // 클라이언트 에러
    res.status(400).send('Bad Request');
  }
})