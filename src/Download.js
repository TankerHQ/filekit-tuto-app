import React from 'react';

class Download extends React.Component {
  constructor(props) {
    super(props);
    this.state = { downloadDone: false };
  }

  async componentDidMount() {
    await this.props.fileKit.downloadToDisk(this.props.fileId);
    this.setState({ downloadDone: true });
  }

  render() {
    if (!this.state.downloadDone)
      return 'Downloading file...';

    return (
      <>
        <p>Download complete!</p>
        <button onClick={this.props.doneCb} id="exit-button">Upload a new file</button>
      </>
    );
  }
}

export default Download;
