
module.exports = {
    isOwner:function(req,res){ //로그인 여부
        if(req.session.is_logined){
            return true;
        }
        else{
            return false;
        }
    },
    statusUI:function(req,res){ //로그인 여부에 따른 로그인/로그아웃 출력변화
        var authStatusUI = '<a href="/auth/login">login</a>'
        if(this.isOwner(req,res)){
          authStatusUI = `${req.session.nickname} | <a href="/auth/logout">logout</a>`
        }
        return authStatusUI;
    },
    Owner:function(req,res){ //로그인 했을 시 세션의 유저아이디 리턴
        if(this.isOwner(req,res)){
            return req.session.user_id;
        }
    }
}