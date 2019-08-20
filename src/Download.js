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
      return <center>Downloading...</center>;

    return (
      <center>
        Downloading done! <br />
        <button onClick={this.props.doneCb} id="exit-button">Exit</button>
      </center>
    );
  }
}

export default Download;
