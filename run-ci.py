import os

import ci
import ci.dmenv
import ci.tanker_configs


def main():
    env = os.environ.copy()
    config = ci.tanker_configs.load("dev")
    env["TANKER_TOKEN"] = config["idToken"]
    env["TANKER_URL"] = config["url"]

    ci.run("yarn")
    with ci.run_in_background("yarn", "start"):
        ci.dmenv.run("pytest", "--verbose", "--capture=no", env=env)


if __name__ == "__main__":
    main()
