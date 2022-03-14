import os
import random

from faker import Faker
from pathlib import Path
import pytest
import selenium.webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.support.ui import WebDriverWait

import tankeradminsdk

APP_ID = "45B0MVMUk44n8Oubw5lY6fy3VugaXC2/ehRUJ4FpELQ="

DEFAULT_TIMEOUT = 30


class WebClient:
    def __init__(self, *, download_dir=None, headless=True):
        self.base_url = "http://127.0.0.1:3000"
        options = ChromeOptions()
        options.headless = headless
        if headless:
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-extensions")
            options.add_argument("--disable-translate")
        else:
            options.add_experimental_option(
                "prefs", {"download.default_directory": str(download_dir)}
            )
        self.driver = selenium.webdriver.Chrome(options=options)
        self.to_home_page()
        # https://bugs.chromium.org/p/chromium/issues/detail?id=696481#c86
        if headless:
            self.driver.command_executor._commands["send_command"] = (
                "POST",
                "/session/$sessionId/chromium/send_command",
            )
            params = {
                "cmd": "Page.setDownloadBehavior",
                "params": {"behavior": "allow", "downloadPath": str(download_dir)},
            }
            self.driver.execute("send_command", params)

    def to_home_page(self):
        self.driver.get(self.base_url)

    def wait_for_element(self, element_id, timeout=DEFAULT_TIMEOUT):
        driver_wait = WebDriverWait(self.driver, timeout)

        def fcn(_):
            res = self.find_element(element_id)
            return res is not None

        driver_wait.until(fcn)
        return self.find_element(element_id)

    def find_element(self, element_id):
        elements = self.driver.find_elements_by_id(element_id)
        if not elements:
            return None
        assert len(elements) == 1
        return elements[0]

    def type_text(self, element, text):
        element.clear()
        element.send_keys(text)

    @property
    def email_field(self):
        return self.wait_for_element("recipient-email-field")

    @property
    def file_field(self):
        file_id = "upload-field"
        self.driver.execute_script(
            f"document.getElementById('{file_id}').style.display='block';"
        )
        return self.wait_for_element(file_id)

    @property
    def upload_button(self):
        return self.wait_for_element("send-button")

    @property
    def download_link(self):
        return self.wait_for_element("download-link")

    @property
    def verification_field(self):
        return self.wait_for_element("tanker-verification-ui-field")

    @property
    def done_button(self):
        return self.wait_for_element("tanker-verification-ui-done-button")

    @property
    def exit_button(self):
        return self.wait_for_element("exit-button")

    def set_email(self, email):
        self.type_text(self.email_field, email)

    def set_file(self, file_path):
        self.type_text(self.file_field, str(file_path))

    def upload(self):
        self.upload_button.click()

    def get_download_link(self):
        return self.download_link.get_attribute("href")

    def type_verification_code(self, verification_code):
        self.type_text(self.verification_field, verification_code)

    def exit_verification(self):
        self.done_button.click()

    def exit_download(self):
        self.exit_button.click()

    def quit(self):
        self.driver.quit()


def get_verification_code(email: str) -> str:
    admin = tankeradminsdk.Admin(
        app_management_token=os.environ["TANKER_MANAGEMENT_API_ACCESS_TOKEN"],
        environment_name=os.environ["TANKER_MANAGEMENT_API_DEFAULT_ENVIRONMENT_NAME"],
        url=os.environ["TANKER_MANAGEMENT_API_URL"],
    )
    auth_token = admin.get_app(APP_ID)["auth_token"]
    return tankeradminsdk.get_verification_code(
        url=os.environ["TANKER_TRUSTCHAIND_URL"],
        app_id=APP_ID,
        auth_token=auth_token,
        email=email,
    )


@pytest.fixture
def download_dir(tmpdir):
    tmp_path = Path(tmpdir)
    return tmp_path / "downloads"


@pytest.fixture
def client(request, download_dir):
    download_dir.mkdir(parents=True, exist_ok=True)
    client = WebClient(
        download_dir=download_dir, headless=request.config.getoption("headless")
    )
    yield client
    client.quit()


def test_upload_download(tmp_path, download_dir, client):
    faker = Faker()
    email = faker.email()
    file_name = "test.txt"
    file_path = tmp_path / file_name
    random_text = str(random.randrange(2 ** 16))
    file_path.write_text(random_text)
    downloaded_file_path = download_dir / file_name

    client.set_email(email)
    client.set_file(file_path)
    client.upload()
    link = client.get_download_link()
    client.driver.get(link)
    assert client.verification_field
    verification_code = get_verification_code(email)
    client.type_verification_code(verification_code)
    client.exit_verification()
    client.exit_download()

    assert downloaded_file_path.exists()
    assert downloaded_file_path.read_text() == random_text


def test_share_to_user_twice(tmpdir, download_dir, client):
    faker = Faker()
    email = faker.email()
    file_name = "test.txt"
    tmp_path = Path(tmpdir)
    file_path = tmp_path / file_name
    random_text = str(random.randrange(2 ** 16))
    file_path.write_text(random_text)
    downloaded_file_path = download_dir / file_name

    client.set_email(email)
    client.set_file(file_path)
    client.upload()
    link = client.get_download_link()
    client.driver.get(link)
    assert client.verification_field
    verification_code = get_verification_code(email)
    client.type_verification_code(verification_code)
    client.exit_verification()
    client.exit_download()

    assert downloaded_file_path.exists()
    assert downloaded_file_path.read_text() == random_text

    downloaded_file_path.unlink()

    client.to_home_page()
    client.set_email(email)
    client.set_file(file_path)
    client.upload()
    link = client.get_download_link()
    client.driver.get(link)
    # no need to verify identity here
    client.exit_download()

    assert downloaded_file_path.exists()
    assert downloaded_file_path.read_text() == random_text
