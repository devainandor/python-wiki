import pytest


class TestWiki:

    def test_index_should_return_list_of_pages(self, app):
        response = app.get('/')
        page = response.data.decode('utf-8')
        assert ('wiki' in page and 'lorem' in page)
