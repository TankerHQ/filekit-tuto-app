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
      const privateIdentity = await this.state.fakeAuth.getPrivateIdentity(email);
      await this.state.fileKit.start(email, privateIdentity);
    } else {
      // Create a new identity with no email attached. This will be thrown away
      const privateIdentity = await this.state.fakeAuth.getPrivateIdentity();
      await this.state.fileKit.startDisposableSession(privateIdentity);
    }

    this.setState({ ready: true });
  }

  render() {
    if (!this.state.ready)
      return <center><p>Loading...</p></center>;

    return (
      <div id="app">
        <h1>FileKit Tutorial Application</h1>
        <p id="demo-warning">
           Warning: this is not a production application, we do not provide any guarantee about stored data. Use it for demonstration purposes only.
        </p>
        <center>
          {this.state.fileId ? (
            <Download fileKit={this.state.fileKit} fileId={this.state.fileId} doneCb={this.downloadDone} />
          ) : (
            <Upload fileKit={this.state.fileKit} fakeAuth={this.state.fakeAuth} />
          )}
        </center>
        <footer>
           Want to build your own file transfer application? Follow the <a href="https://docs.tanker.io/filekit/latest">FileKit Tutorial</a> to get started.
        </footer>
      </div>
    );
  }
}

export default App;
