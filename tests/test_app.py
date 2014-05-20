import pytest


class TestWiki:

    def test_index_should_return_list_of_pages(self, app):
        response = app.get('/')
        page = response.data.decode('utf-8')
        assert ('wiki' in page and 'lorem' in page)

    def test_page_should_show_page_contents(self, app):
        response = app.get('/lorem')
        page = response.data.decode('utf-8')
        assert '<h1>Lorem ipsum</h1>' in page

    def test_page_should_show_template_on_nonexisting_page(self, app):
        response = app.get('/Nonexisting')
        page = response.data.decode('utf-8')
        assert '<h1>Nonexisting</h1>' in page
