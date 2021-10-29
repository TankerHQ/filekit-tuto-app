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
    const { fakeAuth, tanker } = this.props;
    const { file, recipient } = this.state;

    const recipientPublicIdentities = await fakeAuth.getPublicIdentities([ recipient ]);
    const fileId = await tanker.upload(file, { shareWithUsers: recipientPublicIdentities });

    const downloadLink = config.appUrl +
      '?fileId=' + encodeURIComponent(fileId) +
      '&email=' + encodeURIComponent(recipient);

    this.setState({ downloadLink });
  }

  render() {
    const { file, recipient, downloadLink } = this.state;

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
        <button type="submit" id="send-button" disabled={!file || !recipient}>
          Create a secure link
        </button>
      </form>
    );
  }
}

export default Upload;
