const express = require('express');
const {Post, User, Hashtag} = require('../models');
const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.followerCount = req.user ? req.user.Followers.length : 0;
  res.locals.followingCount = req.user ? req.user.Followings.length : 0;
  //이미 팔로워한 상대는 팔로우하기가 아닌 언팔로우로 떠야한다.
  res.locals.followerIdList = req.user ? req.user.Followings.map(f => f.id) : [];
  next();
});

//프로필 페이지
router.get('/profile', (req, res) => {
  res.render('profile', { title: '내 정보 - NodeMission' });
});

//회원가입 페이지
router.get('/join', (req, res) => {
  res.render('join', { title: '회원가입 - NodeMission' });
});

//메인페이지
router.get('/', async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: {
        model: User,
        attributes: ['id', 'nick'],
      },
      order: [['createdAt', 'DESC']],
    });
    res.render('main', {
      title: 'mission',
      twits: posts,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/hashtag', async (req, res, next) => {
  const query = req.query.hashtag;
  if (!query) {
    return res.redirect('/');
  }
  try {
    //해시태그 존재 찾기
    const hashtag = await Hashtag.findOne({ where: { title: query } });
    let posts = [];
    if (hashtag) {//해시태그에 대한 게시글에 작성자까지 가져오기, 보안을 위해 id와 nick값만 가져오기
      posts = await hashtag.getPosts({ include: [{ model: User, attributes:['id', 'nick'] }] });
    }

    return res.render('main', {
      title: `#${query} 검색 결과 | mission`,
      twits: posts,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

module.exports = router;