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
    var selectedText = document.getSelection().toString();
    document.execCommand('createLink', true, selectedText);
});

var listButton = document.getElementById('list');
listButton.addEventListener('click', function() {
    document.execCommand('insertUnorderedList');
});

var checkboxButton = document.getElementById('checkbox');
checkbox.addEventListener('click', function() {
    document.execCommand('insertHTML', true, '<input type="checkbox">&nbsp;');
});

var delButton = document.getElementById('del');
delButton.addEventListener('click', function() {
    document.execCommand('strikeThrough');
});
