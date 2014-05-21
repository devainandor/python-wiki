import os
import codecs

from flask import Flask, render_template, abort, request, Response

app = Flask(__name__)
debug = True if os.getenv('FLASK_ENV', 'production') == 'development' else False
app.config.update(DATADIR='data', DEBUG=debug)


@app.route('/', methods=['GET'])
def index():
    pages = [file[:-5] for file in os.listdir(app.config['DATADIR']) if file.endswith('.html')]
    return render_template('index.html', pages=pages)


@app.route('/<page>', methods=['GET'])
def show_page(page):
    try:
        content = codecs.open(os.path.join(app.config['DATADIR'], page + '.html'), 'r', 'utf-8').read()
        return render_template('page.html', title=page, content=content)
    except IOError:
        return render_template('empty.html', title=page)


@app.route('/<page>', methods=['POST'])
def create_page(page):
    file = os.path.join(app.config['DATADIR'], page + '.html')
    if os.path.exists(file):
        response = Response(status=403)
        response.headers['Allow'] = 'GET, PUT, DELETE, HEAD'
        return response
    with codecs.open(file, 'w', 'utf-8') as newpage:
        try:
            newpage.write(request.form['content'])
            response = Response('201 Created', status=201)
            response.headers['Content-Type'] = 'text/plain; charset=utf-8'
            response.headers['Location'] = '/' + page
            return response
        except IOError:
            abort(500)


@app.route('/<page>', methods=['PUT'])
def update_page(page):
    file = os.path.join(app.config['DATADIR'], page + '.html')
    if not os.path.exists(file):
        abort(404)
    with codecs.open(file, 'w', 'utf-8') as newpage:
        try:
            newpage.write(request.form['content'])
            return Response(status=204)
        except IOError:
            abort(500)


if __name__ == '__main__':
    app.run(host='0.0.0.0')
