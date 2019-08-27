import React from 'react';

import config from './config';

class Upload extends React.Component {
  constructor(props) {
    super(props);
    this.state = { recipient: "", downloadLink: "", file: null, isUploading: false }
  }

  updateFiles(event) {
    // only taking the first file for simplicity
    this.setState({ file: event.target.files[0] });
  }

  updateRecipient(event) {
    this.setState({ recipient: event.target.value });
  }

  onUpload = async (event) => {
    event.preventDefault();
    const { fakeAuth, fileKit } = this.props;
    const { file, recipient } = this.state;
    const recipientPublicIdentities = await fakeAuth.getPublicIdentities([ recipient ]);
    this.setState({ isUploading: true });
    const fileId = await fileKit.upload(file, { shareWithUsers: recipientPublicIdentities });
    this.setState({ isUploading: false });

    const downloadLink = config.appUrl +
      '?fileId=' +
      encodeURIComponent(fileId) +
      '&email=' +
      encodeURIComponent(recipient);
    this.setState({ downloadLink });
  }

  render() {
    const { file, recipient, downloadLink, isUploading } = this.state;
    const uploadReady = file && (recipient !== "");

    if (downloadLink) {
      return (
        <>
          <h1>Done!</h1>
          <p>You can now send this link to <b>{recipient}</b></p>
          <p id="download-link" href={downloadLink}>{downloadLink}</p>
        </>
      );
    }

    return (
      <form onSubmit={this.onUpload}>
        <h1>End-to-end encrypted file transfer</h1>
        <div>
          <input type="file" id="upload-field" required onChange={e => this.updateFiles(e)} />
          <label htmlFor="upload-field">{file ? file.name : 'Select a file to send'}</label>
        </div>
        <input type="email" id="recipient-email-field" required placeholder="Enter the recipient email" value={this.state.recipient} onChange={e => this.updateRecipient(e)} name="recipient"/>
        <button type="submit" id="send-button" disabled={isUploading || !uploadReady}>{isUploading ? 'Uploading...' : 'Create a secure link'}</button>
      </form>
    );
  }
}

export default Upload;
