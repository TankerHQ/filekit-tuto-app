import React from 'react';

import FileKit from '@tanker/filekit';
import FakeAuth from '@tanker/fake-authentication';

import Upload from './Upload'
import Download from './Download'


const appId = 'qzORKAdxrYC/7mSeYTWsPMJkiyv1Vu61n5F/REvtUSk=';
const url = 'https://staging-api.tanker.io';

class App extends React.Component {
    constructor(props){
        super(props);

        const fileKit = new FileKit({trustchainId: appId, url});
        const fakeAuth = new FakeAuth(appId, 'https://staging-fakeauth.tanker.io');

        const urlParams = new URLSearchParams(window.location.search);
        const fileId = urlParams.get('fileId');
        const email = urlParams.get('email');

        this.state = {fakeAuth, fileKit, fileId, email, ready: false};
    }

    async componentDidMount() {
        if (this.state.email) {
            const {privateIdentity, privateProvisionalIdentity} = await this.state.fakeAuth.getPrivateIdentity(this.state.email);
            await this.state.fileKit.start(this.state.email, privateIdentity, privateProvisionalIdentity)
        } else {
          // Create a new identity with no email attached. This will be thrown away
          const {privateIdentity} = await this.fakeAuth.getPrivateIdentity(this.fakeAuth.generateUserId());
          console.log("start anonymous", privateIdentity);
          await this.state.fileKit.startDisposableSession(privateIdentity);
          console.log("status", this.fileKit.tanker.statusName);
        }

        this.setState({ready: true});
    }

    downloadDone = () => {
        this.setState({fileId: null});
    }

    render() {
      if (!this.state.ready)
        return (<center><p>Loading...</p></center>);
      return (
        <center>
          {this.state.fileId ? (
              <Download fileKit={this.state.fileKit} fileId={this.state.fileId} doneCb={this.downloadDone} />
            ) : (
              <Upload fileKit={this.state.fileKit} fakeAuth={this.state.fakeAuth}/>
          )}
        </center>
      );
    }


}

export default App;
