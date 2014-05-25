import os
import codecs
import sqlite3
import re

from flask import Flask, render_template, abort, request, Response, g, jsonify

app = Flask(__name__)
if os.getenv('FLASK_ENV', 'production') == 'production':
    debug = False
    datadir = os.path.join(os.path.expanduser('~'), 'Dropbox/Wiki')
else:
    debug = True
    datadir = 'data'
app.config.update(DATADIR=datadir, DEBUG=debug)
IDX = 'idx.db'


def striphtml(data):
    p = re.compile(r'<.*?>')
    return p.sub('', data)


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(IDX)
    return db


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


def build_index():
    db = sqlite3.connect(IDX)
    cursor = db.cursor()
    cursor.execute('CREATE TABLE IF NOT EXISTS idx (filename text CONSTRAINT utext UNIQUE ON CONFLICT REPLACE, content text)')

    def add_index(filename):
        with codecs.open(os.path.join(app.config['DATADIR'], filename + '.html'), 'r', 'utf-8') as file:
            content = striphtml(file.read())
            cursor.execute('INSERT OR REPLACE INTO idx VALUES (?, ?)', (filename, content))

    [add_index(file[:-5]) for file in os.listdir(app.config['DATADIR']) if file.endswith('.html')]
    db.commit()
    db.close()


def get_pages():
    return [file[:-5] for file in os.listdir(app.config['DATADIR']) if file.endswith('.html')]


@app.route('/', methods=['GET'])
@app.route('/<page>', methods=['GET'])
def show_page(page=None):
    if page is None:
        page = get_pages()[0]
    try:
        content = codecs.open(os.path.join(app.config['DATADIR'], page + '.html'), 'r', 'utf-8').read()
    except IOError:
        content = None
    return render_template('page.html', title=page, content=content, pages=get_pages())


@app.route('/<page>', methods=['POST'])
def create_page(page):
    file = os.path.join(app.config['DATADIR'], page + '.html')
    if os.path.exists(file):
        response = Response(status=403)
        response.headers['Allow'] = 'GET, PUT, DELETE, HEAD'
        return response
    with codecs.open(file, 'w', 'utf-8') as newpage:
        newpage.write(request.form['content'].strip())
        build_index()
        response = Response('201 Created', status=201)
        response.headers['Content-Type'] = 'text/plain; charset=utf-8'
        response.headers['Location'] = '/' + page
        return response


@app.route('/<page>', methods=['PUT'])
def update_page(page):
    file = os.path.join(app.config['DATADIR'], page + '.html')
    if not os.path.exists(file):
        abort(404)
    with codecs.open(file, 'w', 'utf-8') as newpage:
        newpage.write(request.form['content'].strip())
        return Response(status=204)


@app.route('/<page>', methods=['DELETE'])
def delete_page(page):
    file = os.path.join(app.config['DATADIR'], page + '.html')
    if not os.path.exists(file):
        abort(404)
    os.remove(file)
    return Response(status=204)


@app.route('/search/<query>', methods=['GET'])
def search(query):
    cursor = get_db().cursor()
    pages = [row[0] for row in cursor.execute('SELECT filename FROM idx WHERE content LIKE ?', ('%' + query + '%',))]
    return jsonify(pages=pages)


def set_default_page():
    if not get_pages():
        with codecs.open(os.path.join(app.config['DATADIR'], 'index.html'), 'w', 'utf-8') as index:
            index.write("""\
<h1>Index page</h1>
    <div id="content">
    <p>This is a placeholder page for your wiki.</p>
    <p>See more info at <a href="https://github.com/devainandor/python-wiki">https://github.com/devainandor/python-wiki</a>.</p>
""")

if __name__ == '__main__':
    set_default_page()
    build_index()
    app.run(host='0.0.0.0')
