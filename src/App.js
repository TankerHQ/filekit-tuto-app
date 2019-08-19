import React from 'react';

import FileKit from '@tanker/filekit';
import FakeAuthentication from '@tanker/fake-authentication';

import Upload from './Upload';
import Download from './Download';


const appId = 'VoP7W4UypIz1/v9uouNYeWlcRizRPyqMkTnMtUs/dFw=';

class App extends React.Component {
  constructor(props){
    super(props);

    const fileKit = new FileKit({ appId, url: 'https://dev-api.tanker.io' });
    const fakeAuth = new FakeAuthentication({ appId, url: 'https://dev-fakeauth.tanker.io' });

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
      console.log("start anonymous", privateIdentity);
      await this.state.fileKit.startDisposableSession(privateIdentity);
      console.log("status", this.state.fileKit.tanker.statusName);
    }

    this.setState({ ready: true });
  }

  render() {
    if (!this.state.ready)
      return <center><p>Loading...</p></center>;

    return (
      <div id="app">
        <h1>FileKit Tutorial Application</h1>
        <center>
          {this.state.fileId ? (
            <Download fileKit={this.state.fileKit} fileId={this.state.fileId} doneCb={this.downloadDone} />
          ) : (
            <Upload fileKit={this.state.fileKit} fakeAuth={this.state.fakeAuth} />
          )}
        </center>
      </div>
    );
  }
}

export default App;
