// express로 서버를 띄우기 위한 기본 문법
const express = require('express');
const app = express();
require('dotenv').config();

// pubic 폴더를 자유롭게 html, css, js (static) 파일을 제공하기 위한 설정
// __dirname은 현재 실행중인 파일의 경로를 의미
app.use(express.static(__dirname + '/public'))
console.log(process.env.MONGO_DB_URL)

// mongoDB 연결
const { MongoClient } = require('mongodb');

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

// 목록 정적 파일 제공
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
})

app.get('/list', async (req, res) => {
  const result = await db.collection('post').find().toArray()

  console.log(result);
  res.send('목록 list')
})

app.get('/list/:id', function (req, res) {
  res.send('상세보기 list id : ' + req.params.id)
})

app.post('/add', function (req, res) {

  // db.collection('collection이름')
  db.collection('post').insertOne({ test: 'test' }).then(() => {
    console.log('데이터 추가 성공');
  })
})