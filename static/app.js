function setEditable() {
    var title = document.getElementsByTagName('h1')[0];
    title.contentEditable = true;
    var content = document.getElementById('content');
    content.contentEditable = true;
    content.addEventListener('click', function(event) {
        if (event.target.tagName == 'A') {
            window.location = event.target.getAttribute('href').toString();
        }
    });
}

function getMethod() {
    if (content.getAttribute('data-empty') === 'true') {
        return 'POST';
    } else {
        return 'PUT';
    }
}

function saveArticle(async, callback) {
    if (async === null) {
        async = true;
    } else {
        async = false;
    }
    var method = getMethod();
    var article = document.getElementsByTagName('article')[0];
    var content = document.getElementById('content');
    var request = new XMLHttpRequest();
    request.open(method, document.URL, false);
    content.setAttribute('data-empty', 'false');
    var formData = new FormData();
    formData.append('content', article.innerHTML);
    if (callback) {
        request.onload = callback;
    }
    request.send(formData);
}

function deleteArticle() {
    var request = new XMLHttpRequest();
    request.open('DELETE', document.URL);
    request.send();
    request.onload = function() {
        window.location = '/';
    };
}

function insertLink() {
    var selectedText = document.getSelection().toString();
    document.execCommand('createLink', true, selectedText);
}

function initEventHandlers() {
    buttons = [
        {
            id: 'save',
            action: saveArticle
        },
        {
            id: 'delete',
            action: deleteArticle
        },
        {
            id: 'link',
            action: insertLink
        },
        {
            id: 'list',
            action: function() {document.execCommand('insertUnorderedList');}
        },
        {
            id: 'checkbox',
            action: function() {document.execCommand('insertHTML', true, '<input type="checkbox">&nbsp;');}
        },
        {
            id: 'del',
            action: function() {document.execCommand('strikeThrough');}
        }
    ];
    buttons.forEach(function(button) {
        document.getElementById(button.id).addEventListener('click', button.action);
    });
}

window.onload = function() {
    setEditable();
    initEventHandlers();
};

this.onbeforeunload = checkBeforeUnload;

function checkBeforeUnload() {
    saveArticle(false);
}
