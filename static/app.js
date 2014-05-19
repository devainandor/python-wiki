var title = document.getElementsByTagName('h1')[0];
title.contentEditable = true;
var content = document.getElementById('content');
content.addEventListener('click', function() {
    content.contentEditable = true;
});
content.addEventListener('blur', function() {
    content.contentEditable = false;
});
var saveButton = document.getElementById('save');
saveButton.addEventListener('click', function() {
    content.contentEditable = false;
    var article = document.getElementsByTagName('article')[0];
    var request = new XMLHttpRequest();
    request.open('POST', document.URL);
    request.send(article.innerHTML);
});
