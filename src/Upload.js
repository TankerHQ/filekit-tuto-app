import React from 'react';

class Upload extends React.Component {
    constructor(props) {
        super(props);
        this.state = {recipient: "", file: null}
    }

    updateFiles(event) {
        // only taking the first file for simplicity
        this.setState({file: event.target.files[0]});
    }

    updateRecipient(event) {
        this.setState({recipient: event.target.value})
    }

    onSend = async (event) => {
        event.preventDefault();
        const recipient = await this.props.fakeAuth.getUserPublicIdentities([this.state.recipient]);
        const fileId = await this.props.fileKit.upload(this.state.file, { shareWithUsers: Object.values(recipient) });

        const downloadLink = 'http://localhost:3000?fileId='+encodeURIComponent(fileId)+'&email='+encodeURIComponent(this.state.recipient);
        this.setState({downloadLink});
    }

    render() {
        return (
            <form onSubmit={this.onSend}>
              <table border="0">
                <tr>
                  <td align="right"><label htmlFor="recipient-email-field">Recipient email</label></td>
                  <td><input type="email" id="recipient-email-field" placeholder="Recipient email" value={this.state.recipient} onChange={e => this.updateRecipient(e)} name="recipient"/></td>
                </tr>
                <tr>
                  <td align="right"><label htmlFor="upload-field">File to upload</label></td>
                  <td><input type="file" id="upload-field" onChange={e => this.updateFiles(e)} /></td>
                </tr>
                <tr>
                  <td />
                  <td><button type="submit">Send</button></td>
                </tr>
              </table>
              {this.state.downloadLink && <p>Done! Here is the download link <a href={this.state.downloadLink}>{this.state.downloadLink}</a></p>}
            </form>
        );
    }


}

export default Upload;
