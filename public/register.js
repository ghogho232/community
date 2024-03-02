document.getElementById('id_check').addEventListener('click', function(event) {
    event.preventDefault(); // 폼 기본 동작 중단
    var id = document.getElementById('id').value;
    console.log("포스트아이디"+id);

    // 서버로 비밀번호와 ID 전송
    fetch('/auth/id_check', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({ 
            id: id 
        })    
    })
    
    .then(response => response.json())
    .then(response => {
        if(response.error){
            //비밀번호 미입력 시
            document.getElementById('id_usable').style.display = 'none'
            document.getElementById('id_duplicated').style.display = 'inline'
        }
        else {
            document.getElementById('id_usable').style.display = 'inline'
            document.getElementById('id_duplicated').style.display = 'none'
        }
    })
    .catch(error => {
        console.error('서버 통신 중 오류 발생:', error);
    });
});