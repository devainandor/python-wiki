var title = document.getElementsByTagName('h1')[0];
title.contentEditable = true;
var content = document.getElementById('content');
content.contentEditable = true;

function getMethod() {
    if (content.getAttribute('data-empty') === 'true') {
        return 'POST';
    } else {
        return 'PUT';
    }
}

var saveButton = document.getElementById('save');
saveButton.addEventListener('click', function() {
    var article = document.getElementsByTagName('article')[0];
    var request = new XMLHttpRequest();
    request.open(getMethod(), document.URL);
    var formData = new FormData();
    formData.append('content', article.innerHTML);
    request.send(formData);
    content.setAttribute('data-empty', 'false');
});

var deleteButton = document.getElementById('delete');
deleteButton.addEventListener('click', function() {
    var request = new XMLHttpRequest();
    request.open('DELETE', document.URL);
    request.send();
    request.onload = function() {
        window.location = '/';
    };
});
