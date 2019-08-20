import React from 'react';

import config from './config';

class Upload extends React.Component {
  constructor(props) {
    super(props);
    this.state = { recipient: "", downloadLink: "", file: null }
  }

  updateFiles(event) {
    // only taking the first file for simplicity
    this.setState({ file: event.target.files[0] });
  }

  updateRecipient(event) {
    this.setState({ recipient: event.target.value });
  }

  onSend = async (event) => {
    event.preventDefault();
    const { fakeAuth, fileKit } = this.props;
    const { file, recipient } = this.state;
    const recipientPublicIdentities = await fakeAuth.getPublicIdentities([ recipient ]);
    const fileId = await fileKit.upload(file, { shareWithUsers: recipientPublicIdentities });

    const downloadLink = config.appUrl +
      '?fileId=' +
      encodeURIComponent(fileId) +
      '&email=' +
      encodeURIComponent(recipient);
    this.setState({ downloadLink });
  }

  render() {
    const { file, recipient, downloadLink } = this.state;
    const uploadReady = file && (recipient !== "");
    return (
      <form onSubmit={this.onSend}>
        <center>
          <table border="0"><tbody>
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
              <td><button type="submit" id="send-button" disabled={!uploadReady}>Send</button></td>
            </tr>
          </tbody></table>
          {this.state.downloadLink && (
            <p id="download-link">Done! Here is the download link: {this.state.downloadLink}</p>
          )}
        </center>
      </form>
    );
  }
}

export default Upload;
