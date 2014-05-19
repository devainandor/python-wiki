from wsgiref.simple_server import make_server
from string import Template
import codecs
import os

empty_article = """\
<h1>New page</h1>
<div id="content">
<p>…</p>
</div>
"""

template = Template("""\
<!DOCTYPE html>
<meta charset="utf-8">
<title>title</title>
<link rel="stylesheet" href="default.css">
<body>
<a href="/">☿ All pages</a>
<article>
${content}
</article>
<nav>
<button type="submit" id="save">Save</button>
<button disabled id="versions">Versions</button>
<button disabled id="delete">Delete</button>
</nav>
<script src="app.js"></script>
</body>
""")


def get_filename(environ):
    path = environ['PATH_INFO'].strip('/')
    if path in ('default.css', 'app.js'):
        return path
    else:
        return path + '.html'


def write_file(environ):
    body = environ['wsgi.input'].read(int(environ['CONTENT_LENGTH']))
    filename = get_filename(environ)
    with codecs.open(filename, 'w', 'utf-8') as page:
        page.write(body.decode('utf-8').strip())


def get_content(environ):
    filename = get_filename(environ)
    if filename == '.html':
        return ('text/html', build_index().encode('utf-8'))
    if filename.endswith('.html'):
        try:
            content = codecs.open(filename, 'r', 'utf-8').read()
            return ('text/html', template.substitute(content=content).encode('utf-8'))
        except IOError:
            return ('text/html', empty_article)
    if filename.endswith('.css'):
        return ('text/css', codecs.open(filename, 'r', 'utf-8').read().encode('utf-8'))
    if filename.endswith('.js'):
        return ('text/javascript', codecs.open(filename, 'r', 'utf-8').read().encode('utf-8'))


def build_index():
    content = '<br>'.join(['<a href="{file}">{file}</a>'.format(file=file[:-5]) for file in os.listdir('.') if file.endswith('.html')])
    return template.substitute(content=content)


def wiki(environ, start_response):
    if environ['REQUEST_METHOD'].upper() == 'POST':
        write_file(environ)
    content = get_content(environ)
    start_response('200 OK', [('Content-Type', content[0])])
    return [content[1]]

if __name__ == '__main__':
    srv = make_server('localhost', 5000, wiki)
    srv.serve_forever()
