const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const User = require('../models/user');

//로그인 어떻게 할지
module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id); // 유저 id만 세션쿠키로 저장
  });

  passport.deserializeUser((id, done) => {
    User.findOne({
      where: { id },
      //팔로워 팔로잉 유저 리스트들을 인클루드, 보안을 위해 id와 nick값만 가져오기
      include: [{
        model: User,
        attributes: ['id', 'nick'],
        as: 'Followers',
      }, {
        model: User,
        attributes: ['id', 'nick'],
        as: 'Followings',
      }],
    })
      .then(user => done(null, user)) // req.user, req,isAuthenticated()
      .catch(err => done(err));
  });

  local();
  kakao();
};