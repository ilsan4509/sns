const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Post, Hashtag } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

try {
  fs.readdirSync('uploads');
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
  fs.mkdirSync('uploads');
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      //업로드할 위치
      cb(null, 'uploads/');
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      //파일명에 업로드 날짜를 넣어 동일 파일이 덮어씌어지는 일 없도록
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
  console.log(req.file);
  res.json({ url: `/img/${req.file.filename}` });
});

//해시태그 없을 때
//업로드 할 때 이미지 압축시간이 걸리기 때문에, 사용자 편의를 위해 게시길을 먼저 업로드할 수 있게 따로 분리
// router.post('/', isLoggedIn, upload.none(), async(req, res, next) => {
//   try {
//     const post = await Post.create({
//       content: req.body.content,
//       img: req.body.url,
//       UserId: req.user.id,
//     });
//     res.redirect('/');
//   } catch (error) {
//     console.error(error);
//     next(error);
//   }
// });

const upload2 = multer();
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
  try {
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      UserId: req.user.id,
    });
//  (/#[^\s#]*/g)샾으로 시작하여 다음 띄어쓰기와 샾이 아닌것을 모두(g) 골르기
    const hashtags = req.body.content.match(/#[^\s#]*/g);
    //중복되었을 경우 Hashtag[[단어, false], [단어, true]] 
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map(tag => {
          //중복된 단어가 있는지 확인
          return Hashtag.findOrCreate({//트랜젝션 사용
            //앞의 #을 빼고 findOrCreate(태그단어)
            where: { title: tag.slice(1).toLowerCase() },
          })
        }),
        Hashtag.upsert
      );
      console.log(result);
      await post.addHashtags(result.map(r => r[0]));
      // 
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;