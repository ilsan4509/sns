const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();

router.post('/join', isNotLoggedIn, async (req, res, next) => {
  const { email, nick, password } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.redirect('/join?error=exist');
    }
    //기존 데이터에 이메일이 없을 경우
    const hash = await bcrypt.hash(password, 10);
    await User.create({
      email,
      nick,
      //비밀번호만 해시
      password: hash,
    });
    //메인페이지로 이동
    return res.redirect('/');
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

//local 로그인인지, sns 로그인인지 확인하는 과정 단순화를 위해 passport 라이브러리 사용
router.post('/login', isNotLoggedIn, (req, res, next) => {
  //미들웨어를 확장하는 패턴
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.redirect(`/?loginError=${info.message}`);
    }

    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect('/'); //로그인 완료, 세션쿠키 브러우저로 보내기
    });
  })(req, res, next); 
});

router.get('/logout', isLoggedIn, (req, res) => {
  req.user; // 사용자 정보
  req.logout();
  req.session.destroy();
  res.redirect('/');
});

//카카오 로그인 페이지
router.get('/kakao', passport.authenticate('kakao'));

//로그인 완료후 메인페이지 갈때 Request URI에 코드데이터가 있다
router.get('/kakao/callback', passport.authenticate('kakao', {//실패시
  failureRedirect: '/',
}), (req, res) => { // passport/kakaoStrategy.js 성공시
  res.redirect('/');
});

module.exports = router;