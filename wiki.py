from wsgiref.simple_server import make_server
from string import Template as T
import codecs
import os

empty_article = """\
<h1>New page</h1>
<div id="content">
<p>…</p>
</div>
"""

template = T("""\
<!DOCTYPE html>
<meta charset="utf-8">
<title>title</title>
<style>
a:visited {
    color: -webkit-link;
}

body {
    padding: 10%;
    padding-top: 5%;
    font-family: Georgia, Times, Times New Roman, sans-serif;
    line-height: 140%;
}

*:focus {
    outline: none;
}

button {
    padding-top: 1ex;
    padding-bottom: 1ex;
    padding-left: 1.5ex;
    padding-right: 1.5ex;
    color: #00e;
    background: #fff;
    border: 1px solid #00e;
    border-radius: 1ex;
}

button[disabled] {
    color: #666;
    border: 1px solid #666;
}

button#delete {
    color: #f00;
}

article {
    margin-bottom: 1ex;
}

nav {
    margin-bottom: 2ex;
}

nav a {
    text-decoration: none;
    font-size: 120%;
    margin-left: -2ex;
    margin-bottom: 1ex;
}
</style>
<body>
<nav>
<a href="/">☿ All pages</a>
</nav>
<article>
${content}
</article>
<button type="submit" id="save">Save</button>
<button disabled id="versions">Versions</button>
<button disabled id="delete">Delete</button>
<script>
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
</script>
</body>
""")


def get_pagename(environ):
    return environ['PATH_INFO'].strip('/')


def write_file(environ):
    body = environ['wsgi.input'].read(int(environ['CONTENT_LENGTH']))
    filename = get_pagename(environ) + '.html'
    with codecs.open(filename, 'w', 'utf-8') as page:
        page.write(body.decode('utf-8').strip())


def get_content(environ):
    filename = get_pagename(environ) + '.html'
    if filename == '.html':
        return build_index()
    try:
        return codecs.open(filename, 'r', 'utf-8').read()
    except IOError:
        return empty_article


def build_index():
    return '<br>'.join(['<a href="{file}">{file}</a>'.format(file=file[:-5]) for file in os.listdir('.') if file.endswith('.html')])


def wiki(environ, start_response):
    if environ['REQUEST_METHOD'].upper() == 'POST':
        write_file(environ)
    content = get_content(environ)
    start_response('200 OK', [('Content-Type', 'text/html')])
    return [template.substitute(content=content).encode('utf-8')]

if __name__ == '__main__':
    srv = make_server('localhost', 5000, wiki)
    srv.serve_forever()
