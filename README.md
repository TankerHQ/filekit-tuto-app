[last-commit-badge]: https://img.shields.io/github/last-commit/TankerHQ/filekit-tuto-app.svg?label=Last%20commit&logo=github
[license-badge]: https://img.shields.io/badge/License-Apache%202.0-blue.svg
[license-link]: https://opensource.org/licenses/Apache-2.0
[platform-badge]: https://img.shields.io/static/v1.svg?label=Platform&message=javascript&color=lightgrey

<a href="#readme"><img src="https://tanker.io/images/github-logo.png" alt="Tanker logo" width="180" /></a>

[![License][license-badge]][license-link]
![Platform][platform-badge]
![Last Commit][last-commit-badge]

[Overview](#Overview) - [Running the application on your machine](#running-the-example-on-your-machine) - [Documentation](#documentation)

# Tanker FileKit Tutorial Application

## Overview

Tanker FileKit handles end-to-end encrypted files in your apps. Files are encrypted client-side, before being uploaded, and can only be read by the sender and recipients.

This repository features an example application using Tanker FileKit.

## Running the example on your machine

Check your [Node.js](https://nodejs.org/en/) and [Yarn](https://yarnpkg.com/en/docs/install) versions, and upgrade if needed:

```bash
node -v  # >= 12   (supported version)
yarn -v  # >= 1.0  (workspaces support)
```

Clone this repository:

```bash
git clone https://github.com/TankerHQ/filekit-tuto-app.git
```

Install all dependencies at once:
```bash
yarn
```

Configure the project for &lt;env&gt; (local, dev, or prod)
```bash
cd src/ && ln -s config.<env>.js config.js
```

Run the application
```bash
yarn start
```

Done! The application should now be reachable at the `http://127.0.0.1:3000` URL.

# Documentation

Learn more about the tutorial application and Tanker FileKit in the [FileKit documentation](https://docs.tanker.io/latest/tutorials/file-transfer/).
