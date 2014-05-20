import os

from flask import Flask, render_template

app = Flask(__name__)
app.config.update(DATADIR='tests/data')


@app.route('/', methods=['GET'])
def index():
    pages = [file[:-5] for file in os.listdir(app.config['DATADIR']) if file.endswith('.html')]
    return render_template('index.html', pages=pages)

if __name__ == '__main__':
    app.run()
