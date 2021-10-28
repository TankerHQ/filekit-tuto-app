import React from 'react';

import { Tanker } from '@tanker/client-browser';
import FakeAuthentication from '@tanker/fake-authentication';
import VerificationUI from '@tanker/verification-ui';

import Download from './Download';
import Upload from './Upload';

import config from './config';

class App extends React.Component {
  constructor(props){
    super(props);

    const { appId, tankerApiUrl, fakeAuthApiUrl } = config;
    this.tanker = new Tanker({ appId, url: tankerApiUrl });
    this.verificationUI = new VerificationUI(this.tanker);
    this.fakeAuth = new FakeAuthentication({ appId, url: fakeAuthApiUrl });

    const urlParams = new URLSearchParams(window.location.search);
    const fileId = urlParams.get('fileId');
    const email = urlParams.get('email');

    this.state = { fileId, email, ready: false };
  }

  async startDisposableSession() {
    const { identity } = await this.fakeAuth.getIdentity();
    const status = await this.tanker.start(identity);

    switch (status) {
      case Tanker.statuses.IDENTITY_REGISTRATION_NEEDED: {
        const genVerificationKey = await this.tanker.generateVerificationKey();
        await this.tanker.registerIdentity({ verificationKey: genVerificationKey });
        return;
      }
      case Tanker.statuses.IDENTITY_VERIFICATION_NEEDED: {
        throw new Error('This identity has already been used, create a new one.');
      }
      // When hitting back or forward on the browser you can start a disposable
      // session with the same identity twice because the browser is caching
      // the xhr request to fake-auth (or another identity server)
      case Tanker.statuses.READY: {
        return;
      }
      default:
        throw new Error(`Assertion error: unexpected status ${status}`);
    }
  }

  async componentDidMount() {
    const { email } = this.state;

    if (email) {
      const { identity, provisionalIdentity } = await this.fakeAuth.getIdentity(email);
      await this.verificationUI.start(email, identity, provisionalIdentity);
      await this.fakeAuth.setIdentityRegistered(email);
    } else {
      await this.startDisposableSession();
    }

    this.setState({ ready: true });
  }

  downloadDone = () => {
    this.setState({ fileId: null });
  }

  render() {
    const { fileId, ready } = this.state;

    return (
      <>
        <header>
          This app uses the Core SDK to encrypt and store files.<br/>
          Follow <a href="https://docs.tanker.io/latest/tutorials/file-transfer/">our tutorial</a> to build your app.
        </header>
        <section>
          {!ready ? (
            <p>Loading...</p>
          ) : (
            fileId ? (
              <Download tanker={this.tanker} fileId={fileId} doneCb={this.downloadDone} />
            ) : (
              <Upload tanker={this.tanker} fakeAuth={this.fakeAuth} />
            )
          )}
        </section>
      </>
    );
  }
}

export default App;
