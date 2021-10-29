import React from 'react';

import { saveAs } from 'file-saver';

class Download extends React.Component {
  constructor(props) {
    super(props);

    this.state = { downloadDone: false };
  }

  async componentDidMount() {
    const { fileId, tanker } = this.props;
    const file = await tanker.download(fileId);
    saveAs(file)
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
