import argparse
import os
import shutil
import sys

import tankerci

GITHUB_URL = "git@github.com:TankerHQ/filekit-tuto-app"


def check():
    shutil.copy("src/config.dev.js", "src/config.js")
    tankerci.run("yarn")
    with tankerci.run_in_background("yarn", "start"):
        # fmt: off
        tankerci.run(
            "poetry", "run", "pytest",
            "--verbose",
            "--capture=no",
            "--headless",
        )
        # fmt: on


def deploy():
    shutil.copy("src/config.prod.js", "src/config.js")

    tankerci.run("yarn")
    tankerci.run("yarn", "build")

    commit_sha = os.environ["CI_COMMIT_SHA"]
    message = f"Deploy {commit_sha}"
    # Ensure 'github' remote exists
    tankerci.run("git", "remote", "remove", "github", check=False)
    tankerci.run("git", "remote", "add", "github", GITHUB_URL)
    # fmt: off
    tankerci.run(
        "ghp-import",
        "--message", message,
        "--remote", "github",
        "--push",
        "--force",
        "--no-jekyll",
        "build/",
    )
    # fmt:on


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
