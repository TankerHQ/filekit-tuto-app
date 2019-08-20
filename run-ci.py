import argparse
import os

import cli_ui as ui
from path import Path

import ci
import ci.dmenv
import ci.tanker_configs
import ci.git

GITHUB_URL = "git@github.com:TankerHQ/filekit-tuto-app"


def check():
    env = os.environ.copy()
    config = ci.tanker_configs.load("dev")
    env["TANKER_TOKEN"] = config["idToken"]
    env["TANKER_API_URL"] = config["url"]

    Path("src/config.dev.js").copy("src/config.js")

    ci.run("yarn")
    with ci.run_in_background("yarn", "start"):
        ci.dmenv.run(
            "pytest", "--verbose", "--capture=no", "--headless", "--headless", env=env
        )


def deploy():
    Path("src/config.prod.js").copy("src/config.js")

    ci.run("yarn")
    ci.run("yarn", "build")

    commit_sha = os.environ["CI_COMMIT_SHA"]
    message = f"Deploy {commit_sha}"
    # Ensure 'github' remote exists
    ci.run("git", "remote", "remove", "github", check=False)
    ci.run("git", "remote", "add", "github", GITHUB_URL)
    # fmt: off
    ci.run(
        "ghp-import",
        "--message", message,
        "--remote", "github",
        "--push",
        "--force",
        "build/",
    )
    # fmt:on

    ci.git.mirror(github_url=GITHUB_URL)


def main():
    parser = argparse.ArgumentParser()

    subparsers = parser.add_subparsers(title="subcommands", dest="command")
    subparsers.add_parser("check")
    subparsers.add_parser("deploy")

    args = parser.parse_args()

    if args.command == "check":
        check()
    elif args.command == "deploy":
        deploy()
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
