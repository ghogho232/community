
document.getElementById('submit-btn').addEventListener('click', function(event) {
    event.preventDefault(); // 폼 기본 동작 중단

    var password = document.getElementById('password').value;
    var post_id = document.getElementById('id').value;
    console.log("포스트아이디"+post_id);
    console.log("포스트비밀번호"+password);
    // 서버로 비밀번호와 ID 전송
    fetch('/topic/delete_auth_process', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({ 
            password: password, 
            post_id: post_id 
        })    
    })
    
    .then(response => response.json())
    .then(response => {
        if(response.error == '비밀번호를 입력하시오.'){
            //비밀번호 미입력 시
            document.getElementById('password-error').style.display = 'none'
            document.getElementById('password-empty').style.display = 'inline'
        }
        else if (response.error) {
            // 서버에서 에러 날라오면 틀렸다고 메시지 출력
            document.getElementById('password-empty').style.display = 'none'
            document.getElementById('password-error').style.display = 'inline'
        } else {
            window.location.href = '/'; // 맞으면 홈으로
        }
    })
    .catch(error => {
        console.error('서버 통신 중 오류 발생:', error);
    });
});