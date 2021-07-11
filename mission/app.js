const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks'); //먼저 프론트를 nunjucks로 구축하고...
const dotenv = require('dotenv');
const passport = require('passport');

//dotenv 설정 값 맨위에 두고 적용
dotenv.config();
const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');
const {sequelize} = require('./models');
const passportConfig = require('./passport');

const app = express();
app.set('port', process.env.PORT || 8001);
//nunjucks 설정
app.set('view engine', 'html');
nunjucks.configure('views', {
  express: app,
  watch: true,
});
//force: true 기존데이터 사라지고 테이블 재생성한다.
//alter: true 기존 데이터 유지하고 컬럼 수정, 하지만 기존데이터랑 컬럼이 안맞아서 에러 날 수 있다.
sequelize.sync({force: false})
  .then(()=>{
    console.log('데이터베이스 연결 성공');
  })
  .catch((err)=>{
    console.error(err);
  })
//passport/index.js의 passport.serializeUser와 연결
passportConfig();

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
//img를 요청하면 upload폴더안 파일을 불러온다.
app.use('/img', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', pageRouter);
app.use('/auth', authRouter);
app.use('/post', postRouter);
app.use('/user', userRouter);


//모든 라우터 뒤에 나올 것
//404처리 미들웨어
app.use((req, res, next) => {
  const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

//에러 미들웨어
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  //폴더 위치 가리기
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500).res.render('error');
});

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기중');
});