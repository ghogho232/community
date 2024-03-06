
module.exports = {
    restrictUrlAccess : function(req, res, next) {
        // 원하는 URL을 여기에 추가합니다.
        const allowedUrls = ['/topic/update/..', '/topic/update/42', '/topic/update/43']; // 허용할 URL 목록
        
        
        if(req.originalUrl.startsWith('/topic/update/')){
            res.status(403).send('Access Forbidden');
        }
        // 요청된 URL이 허용 목록에 포함되어 있는지 확인
        if (!allowedUrls.includes(req.originalUrl)) {
          // 허용되는 URL인 경우 다음 미들웨어로 이동
          next();
          console.log(req.originalUrl);
        } 

        else {
          // 허용되지 않는 URL인 경우 403 Forbidden 응답을 전송
          res.status(403).send('Access Forbidden');
        }
      }
      
}