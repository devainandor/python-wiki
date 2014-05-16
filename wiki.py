from wsgiref.simple_server import make_server
from string import Template as T
import codecs

empty_article = """\
<h1 contenteditable="true">New page</h1>
<div contenteditable="true">
<p>…</p>
</div>
"""

template = T("""\
<!DOCTYPE html>
<meta charset="utf-8">
<title>title</title>
<article>
${article}
</article>
<button type="submit" id="save">Save</button>
<script>
var saveButton = document.getElementById('save');
saveButton.addEventListener('click', function() {
    var article = document.getElementsByTagName('article')[0];
    var request = new XMLHttpRequest();
    request.open('POST', document.URL);
    request.send(article.innerHTML);
});
</script>
""")


def get_filename(environ):
    pagename = environ['PATH_INFO'].strip('/')
    if pagename == '':
        return 'index.html'
    else:
        return pagename + '.html'


def write_file(environ):
    body = environ['wsgi.input'].read(int(environ['CONTENT_LENGTH']))
    filename = get_filename(environ)
    with codecs.open(filename, 'w', 'utf-8') as page:
        page.write(body.decode('utf-8').strip())


def read_file(environ):
    filename = get_filename(environ)
    try:
        return codecs.open(filename, 'r', 'utf-8').read()
    except IOError:
        return empty_article


# available URLs:
# POST <page name>
# GET <page name>
# GET /
def wiki(environ, start_response):
    if environ['REQUEST_METHOD'].upper() == 'POST':
        write_file(environ)
    article = read_file(environ)
    start_response('200 OK', [('Content-Type', 'text/html')])
    return [template.substitute(article=article).encode('utf-8')]

if __name__ == '__main__':
    srv = make_server('localhost', 5000, wiki)
    srv.serve_forever()
