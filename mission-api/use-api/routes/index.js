const express = require('express');
const axios = require('axios');

const router = express.Router();

// 토큰 테스트 라우터
router.get('/test', async (req, res, next) => { 
  try {
    if (!req.session.jwt) { // 세션에 토큰이 없으면 토큰 발급 시도
      const tokenResult = await axios.post('http://localhost:8002/v1/token', {
        //clientSecret 제대로 발급 받았으니 토큰을 주라
        clientSecret: process.env.CLIENT_SECRET,
      });
      if (tokenResult.data && tokenResult.data.code === 200) { // 토큰 발급 성공
        // 세션에 토큰 저장
        req.session.jwt = tokenResult.data.token;
      } else { // 토큰 발급 실패
        // 발급 실패 사유 응답
        return res.json(tokenResult.data); 
      }
    }
    // 발급받은 토큰 테스트
    const result = await axios.get('http://localhost:8002/v1/test', {
        //토큰이 유효한지, 유효기간이 안지났는지
      headers: { authorization: req.session.jwt },
    });
    return res.json(result.data);
  } catch (error) {
    console.error(error);
    // 토큰 만료 시
    if (error.response.status === 419) { 
      return res.json(error.response.data);
    }
    return next(error);
  }
});

module.exports = router;

