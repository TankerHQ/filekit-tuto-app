def pytest_addoption(parser):
    parser.addoption("--headless", action="store_true", help="run headless browser")
