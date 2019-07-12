import React from 'react';

import FileKit from '@tanker/filekit';
import FakeAuth from '@tanker/fake-authentication';

import uuid from 'uuid';

import Upload from './Upload'
import Download from './Download'


const appId = '4UY17Jl/TcvB6P1j8fgX5ZMuigcmZMfq9nRfLvzztiU=';
const url = 'https://staging-api.tanker.io';

class App extends React.Component {
    constructor(props){
        super(props);

        this.fileKit = new FileKit({trustchainId: appId, url});
        this.fakeAuth = new FakeAuth(appId, 'https://staging-fakeauth.tanker.io');

        const urlParams = new URLSearchParams(window.location.search);
        const fileId = urlParams.get('fileId');
        const email = urlParams.get('email');

        this.state = {fileId, email, ready: false};
    }

    async componentDidMount() {
        if (this.state.email) {
            const {privateIdentity, privateProvisionalIdentity} = await this.fakeAuth.getPrivateIdentity(this.state.email);
            await this.fileKit.start(privateIdentity, privateProvisionalIdentity)
        } else {
          // Create a new identity with no email attached. This will be thrown away
          const {userId, privateIdentity} = await this.fakeAuth.getPrivateIdentity();
          console.log(userId, privateIdentity);
          await this.fileKit.startWithVerificationKey(privateIdentity);
        }

        this.setState({ready: true});
    }

    downloadDone = () => {
        this.setState({fileId: null});
    }

    render() {
        if (!this.state.ready)
            return (<p>Loading...</p>);
        if (this.state.fileId)
            return (<Download fileKit={this.fileKit} fileId={this.state.fileId} doneCb={this.downloadDone} />);
        return (<Upload fileKit={this.fileKit} fakeAuth={this.fakeAuth}/>);
    }


}

export default App;
