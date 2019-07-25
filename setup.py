from setuptools import setup

setup(
    name="tanker-filetransfer",
    extras_require={"dev": [
        "faker",
        "path-py",
        "pytest",
        "selenium",
        "tankersdk==2.0.2"
    ]},
)
