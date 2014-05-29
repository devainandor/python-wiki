import os
import codecs
import sqlite3
import re

from flask import Flask, render_template, abort, request, Response, g, jsonify, redirect, url_for

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


def get_filename(page):
    return os.path.join(app.config['DATADIR'], page + '.html')


def build_index():
    db = sqlite3.connect(IDX)
    cursor = db.cursor()
    cursor.execute('CREATE TABLE IF NOT EXISTS idx (page text CONSTRAINT utext UNIQUE ON CONFLICT REPLACE, content text)')

    def add_index(page):
        with codecs.open(get_filename(page), 'r', 'utf-8') as file:
            content = striphtml(file.read())
            cursor.execute('INSERT OR REPLACE INTO idx VALUES (?, ?)', (page, content))

    [add_index(file[:-5]) for file in os.listdir(app.config['DATADIR']) if file.endswith('.html')]
    db.commit()
    db.close()


def remove_index(page):
    db = sqlite3.connect(IDX)
    cursor = db.cursor()
    cursor.execute('DELETE FROM idx where page = ?', (page,))
    db.commit()
    db.close()


def get_pages():
    return [file[:-5] for file in os.listdir(app.config['DATADIR']) if file.endswith('.html')]


@app.route('/', methods=['GET'])
def index():
    try:
        page = get_pages()[0]
    except IndexError:
        create_default_page()
        page = 'index'
    return redirect(url_for('show_page', page=page))


@app.route('/<page>', methods=['GET'])
def show_page(page):
    try:
        content = codecs.open(get_filename(page), 'r', 'utf-8').read()
    except IOError:
        content = None
    return render_template('page.html', title=page, content=content, pages=get_pages())


@app.route('/<page>', methods=['POST'])
def create_page(page):
    file = get_filename(page)
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
    file = get_filename(page)
    if not os.path.exists(file):
        abort(404)
    with codecs.open(file, 'w', 'utf-8') as newpage:
        newpage.write(request.form['content'].strip())
        build_index()
        return Response(status=204)


@app.route('/<page>', methods=['DELETE'])
def delete_page(page):
    file = get_filename(page)
    if not os.path.exists(file):
        abort(404)
    os.remove(file)
    remove_index(page)
    return Response(status=204)


@app.route('/search/<query>', methods=['GET'])
def search(query):
    cursor = get_db().cursor()
    pages = [row[0] for row in cursor.execute('SELECT page FROM idx WHERE content LIKE ?', ('%{}%'.format(query),))]
    return jsonify(pages=pages)


@app.route('/files', methods=['GET'])
def list_files():
    pages = get_pages()
    return jsonify(pages=pages)


def create_default_page():
    if not get_pages():
        with codecs.open(os.path.join(app.config['DATADIR'], 'index.html'), 'w', 'utf-8') as index:
            index.write("""\
<h1>Index page</h1>
<div id="content">
<p>This is a placeholder page for your wiki. Click anywhere in the text or the title to edit. The default editing keybindings (bold, italic, undo etc.) work.</p>
<p>This wiki <strong>does not use versioning.</strong> Please use Dropbox or Time Machine for any valuable data.</p>
<p>See more info at <a href="https://github.com/devainandor/python-wiki">https://github.com/devainandor/python-wiki</a>.</p>
""")

if __name__ == '__main__':
    create_default_page()
    build_index()
    app.run(host='0.0.0.0')
