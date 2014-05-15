from wsgiref.simple_server import make_server
from string import Template as T
import codecs

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
    request.open('POST', '/');
    request.send(article.innerHTML);
});
</script>
""")


def write_file(environ):
    body = environ['wsgi.input'].read(int(environ['CONTENT_LENGTH']))
    print(body.decode('utf-8'))
    with codecs.open('page.html', 'w', 'utf-8') as page:
        page.write(body.decode('utf-8').strip())


def read_file():
    return codecs.open('page.html', 'r', 'utf-8').read()


def wiki(environ, start_response):
    if environ['REQUEST_METHOD'].upper() == 'POST':
        write_file(environ)
    article = read_file()
    start_response('200 OK', [('Content-Type', 'text/html')])
    return [template.substitute(article=article).encode('utf-8')]

srv = make_server('localhost', 5000, wiki)
srv.serve_forever()
