import argparse
import os
import sys

from path import Path

import ci
import ci.tanker_configs
import ci.git

GITHUB_URL = "git@github.com:TankerHQ/filekit-tuto-app"


def check():
    Path("src/config.dev.js").copy("src/config.js")
    ci.run("yarn")
    with ci.run_in_background("yarn", "start"):
        # fmt: off
        ci.run(
            "poetry", "run", "pytest",
            "--verbose",
            "--capture=no",
            "--headless",
        )
        # fmt: on


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
        "--no-jekyll",
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
