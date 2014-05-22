var title = document.getElementsByTagName('h1')[0];
title.contentEditable = true;
var content = document.getElementById('content');
content.contentEditable = true;

content.addEventListener('click', function(event) {
    if (event.target.tagName == 'A') {
        window.location = event.target.getAttribute('href').toString();
    }
});

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
    content.setAttribute('data-empty', 'false');
    var formData = new FormData();
    formData.append('content', article.innerHTML);
    request.send(formData);
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

var linkButton = document.getElementById('link');
linkButton.addEventListener('click', function() {
    var selection = document.getSelection();
    var range = selection.getRangeAt(0);
    var a = document.createElement('a');
    var selectedText = selection.toString();
    var text = document.createTextNode(selectedText);
    a.appendChild(text);
    a.setAttribute('href', '/' + selectedText);
    range.deleteContents();
    range.insertNode(a);
});
