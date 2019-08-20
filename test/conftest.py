def pytest_addoption(parser):
    print("Adding option headless")
    parser.addoption("--headless", action="store_true", help="run headless browser")
