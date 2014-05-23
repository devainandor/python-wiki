import codecs
import os
import shutil

import pytest


class TestWiki:

    def setup(self):
        def listfiles(dir):
            return [file for file in os.listdir(dir) if not file.startswith('.')]
        [os.remove('tests/data/' + file) for file in listfiles('tests/data')]
        [shutil.copy('tests/fixtures/' + file, 'tests/data') for file in listfiles('tests/fixtures')]

    def test_index_should_return_list_of_pages(self, app):
        response = app.get('/')
        page = response.data.decode('utf-8')
        assert ('wiki' in page and 'lorem' in page)

    def test_should_show_page_contents(self, app):
        response = app.get('/lorem')
        page = response.data.decode('utf-8')
        assert '<h1>Lorem ipsum</h1>' in page

    def test_should_show_template_on_nonexisting_page(self, app):
        response = app.get('/Nonexisting')
        page = response.data.decode('utf-8')
        assert '<h1>Nonexisting</h1>' in page

    def test_should_create_new_page(self, app):
        content = '<h1>Now it exists</h1><div id="content"><p>with content</p></div>'
        response = app.post('/Nonexisting', data={'content': content})
        filecontent = codecs.open('tests/data/Nonexisting.html', 'r', 'utf-8').read()
        assert filecontent == content

    def test_should_update_existing_page(self, app):
        content = '<h1>Updated</h1><div id="content"><p>with new content</p></div>'
        response = app.put('/wiki', data={'content': content})
        filecontent = codecs.open('tests/data/wiki.html', 'r', 'utf-8').read()
        assert filecontent == content

    def test_should_not_create_existing_page(self, app):
        response = app.post('/lorem')
        assert response.status == '403 FORBIDDEN'

    def test_should_not_update_nonexisting_page(self, app):
        response = app.put('/Nonexisting')
        assert response.status == '404 NOT FOUND'

    def test_should_delete_existing_page(self, app):
        response = app.delete('/wiki')
        assert response.status == '204 NO CONTENT'

    def test_should_return_notfound_on_delete_nonexisting_page(self, app):
        response = app.delete('/Nonexisting')
        assert response.status == '404 NOT FOUND'

    def test_should_find_file_by_content(self, app):
        response = app.get('/search/ipsum')
        page = response.data.decode('utf-8')
        assert 'lorem' in page
        assert 'wiki' not in page
