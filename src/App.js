import React from 'react';

import FileKit from '@tanker/filekit';
import FakeAuthentication from '@tanker/fake-authentication';

import Upload from './Upload';
import Download from './Download';
import config from './config';

class App extends React.Component {
  constructor(props){
    super(props);

    const { appId, tankerApiUrl, fakeAuthApiUrl } = config;
    const fileKit = new FileKit({ appId, url: tankerApiUrl });
    const fakeAuth = new FakeAuthentication({ appId, url: fakeAuthApiUrl });

    const urlParams = new URLSearchParams(window.location.search);
    const fileId = urlParams.get('fileId');
    const email = urlParams.get('email');

    this.state = { fakeAuth, fileKit, fileId, email, ready: false };
  }

  downloadDone = () => {
    this.setState({ fileId: null });
  }

  async componentDidMount() {
    const { email } = this.state;
    if (email) {
      const privateIdentity = await this.state.fakeAuth.getIdentity(email);
      await this.state.fileKit.start(email, privateIdentity);
    } else {
      // Create a new identity with no email attached. This will be thrown away
      const privateIdentity = await this.state.fakeAuth.getIdentity();
      await this.state.fileKit.startDisposableSession(privateIdentity);
    }

    this.setState({ ready: true });
  }

  render() {
    return (
      <>
        <section>
          {!this.state.ready ? (
            <p>Loading...</p>
          ) : (
            this.state.fileId ? (
              <Download fileKit={this.state.fileKit} fileId={this.state.fileId} doneCb={this.downloadDone} />
            ) : (
              <Upload fileKit={this.state.fileKit} fakeAuth={this.state.fakeAuth} />
            )
          )}
        </section>
        <footer>
          This app was built using FileKit. Follow <a href="https://docs.tanker.io/filekit/latest/tutorials/file-transfer/">our tutorial</a> to build your own.
        </footer>
      </>
    );
  }
}

export default App;
