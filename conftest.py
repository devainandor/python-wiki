import os
import pytest
import wiki


@pytest.fixture
def app():
    app = wiki.app
    app.config.update(DEBUG=True)
    return app.test_client()
