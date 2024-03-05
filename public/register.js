let isIdChecked = false; // 중복확인 버튼이 눌렸는지 여부

document.getElementById('id_check').addEventListener('click', function(event) {
    event.preventDefault(); // 폼 기본 동작 중단
    var id = document.getElementById('id').value;

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
            //아이디 중복 시
            document.getElementById('duplicated_check').style.display = 'none';
            document.getElementById('id_usable').style.display = 'none';
            document.getElementById('id_duplicated').style.display = 'inline';
            document.getElementById('id').value = '';
        }
        else {
            document.getElementById('duplicated_check').style.display = 'none';
            document.getElementById('id_usable').style.display = 'inline';
            document.getElementById('id_duplicated').style.display = 'none';
            isIdChecked = true; // 중복확인 완료
        }
    })
    .catch(error => {
        console.error('서버 통신 중 오류 발생:', error);
    });
});

document.getElementById('register-form').addEventListener('submit', function(event) {
    if (!isIdChecked) { // 중복확인이 완료되지 않았으면
        event.preventDefault(); // 폼 제출 방지
        document.getElementById('duplicated_check').style.display = 'inline'
        
    }
});