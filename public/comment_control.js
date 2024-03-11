var deleteButtons = document.getElementsByClassName('comment-delete-btn');
var post_id = document.getElementsByClassName('post_id').post_id.value;

for (var i = 0; i < deleteButtons.length; i++) {
    deleteButtons[i].addEventListener('click', function(event) {
        event.preventDefault(); // 폼 기본 동작 중단
        var author = this.closest('tr').querySelector('.author_id');
        var author_id = author.value;

        if(author_id == 1){ //익명유저 댓글이면 
            // 클릭된 삭제 버튼의 부모 요소에서 클래스가 comment_pwd인거 찾기
            var passwordInput = this.closest('tr').querySelector('.comment_pwd');
            var password = passwordInput.value;

            var commentIdInput = this.closest('tr').querySelector('.comment_id');
            var commentId = commentIdInput.value;
            
            var input_pwd = prompt("비밀번호는?", ""); //비밀번호 입력

            // 서버로 입력 비밀번호와 댓글 ID 전송
            fetch('/comment/delete_anony_comment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                body: JSON.stringify({ 
                    password: input_pwd, 
                    comment_id: commentId
                })    
            })
            
            .then(response => response.json())
            .then(response => {
                if(response.error == '비밀번호를 입력하시오'){
                    //비밀번호 미입력 시
                    alert("비밀번호를 입력하시오");
                }
                else if(response.error == '삭제할 수 없습니다'){
                    alert("로그인 중이므로 삭제할 수 없습니다");
                }
                else if (response.error) {
                    // 서버에서 에러 날라오면 틀렸다고 메시지 출력
                    alert("비밀번호가 틀렸습니다");
                } else {
                    alert("삭제되었습니다");
                    // window.location.href = `${post_id}`; // 맞으면 홈으로
                    history.go(0);
                }
            })
            .catch(error => {
                console.error('서버 통신 중 오류 발생:', error);
            });
            
        }
        else{ // 로그인 유저 댓글이면
            var commentIdInput = this.closest('tr').querySelector('.comment_id');
            var commentId = commentIdInput.value;

            // 서버로 입력 비밀번호와 댓글 ID 전송
            fetch('/comment/delete_comment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                body: JSON.stringify({ 
                    author_id: author_id, 
                    comment_id: commentId
                })    
            })
            
            .then(response => response.json())
            .then(response => {
                if (response.error) {
                    // 서버에서 에러 날라오면 오류 메시지 출력
                    alert("삭제할 수 없습니다.");
                } else {
                    alert("삭제되었습니다");
                    // window.location.href = `${post_id}`; // 맞으면 홈으로
                    history.go(0);
                }
            })
            .catch(error => {
                console.error('서버 통신 중 오류 발생:', error);
            });
            
        }
});
}